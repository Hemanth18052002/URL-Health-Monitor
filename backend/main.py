from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import requests
import sqlite3
import time
import os
from pathlib import Path

app = FastAPI(title="URL Health Monitor API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLCheckRequest(BaseModel):
    urls: List[str]

class URLStatusResponse(BaseModel):
    url: str
    status: str
    response_time: float
    uptime_percentage: float
    last_checked: str
    url_id: int
    warning: Optional[str] = None

def get_db():
    db_path = Path(__file__).parent / "url_health.db"
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn

def check_url(url: str) -> dict:
    try:
        if not url.startswith(('http://', 'https://')):
            url = f"https://{url}"
        
        start_time = time.time()
        try:
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            end_time = time.time()
            response_time = end_time - start_time
            
            return {
                "status": "UP",
                "response_time": response_time,
                "success": True
            }
        except requests.exceptions.SSLError:
            response = requests.get(url, timeout=5, verify=False)
            response.raise_for_status()
            end_time = time.time()
            response_time = end_time - start_time
            
            return {
                "status": "UP",
                "response_time": response_time,
                "success": True,
                "warning": "SSL verification disabled"
            }
    except requests.exceptions.RequestException as e:
        return {
            "status": "DOWN",
            "response_time": 0.0,
            "success": False,
            "error": str(e)
        }
    except Exception as e:
        return {
            "status": "DOWN",
            "response_time": 0.0,
            "success": False,
            "error": f"Unexpected error: {str(e)}"
        }

@app.post("/check-urls/", response_model=List[URLStatusResponse])
async def check_urls(request: URLCheckRequest):
    if not request.urls:
        raise HTTPException(status_code=422, detail="The 'urls' list cannot be empty")
    
    results = []
    conn = get_db()
    try:
        cursor = conn.cursor()
        
        # Create tables if they don't exist
        cursor.executescript('''
            CREATE TABLE IF NOT EXISTS urls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT UNIQUE,
                status TEXT,
                response_time REAL,
                uptime_percentage REAL DEFAULT 100.0,
                last_checked TEXT
            );
            
            CREATE TABLE IF NOT EXISTS url_checks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url_id INTEGER,
                status TEXT,
                response_time REAL,
                timestamp TEXT,
                FOREIGN KEY (url_id) REFERENCES urls (id)
            );
        ''')
        
        for url in request.urls:
            if not url.strip():
                continue
                
            result = check_url(url)
            
            cursor.execute("SELECT id FROM urls WHERE url = ?", (url,))
            row = cursor.fetchone()
            
            if not row:
                cursor.execute('''
                    INSERT INTO urls (url, status, response_time, uptime_percentage, last_checked)
                    VALUES (?, ?, ?, ?, ?)
                ''', (url, result["status"], result["response_time"], 
                     100.0 if result["status"] == "UP" else 0.0, datetime.now().isoformat()))
                url_id = cursor.lastrowid
            else:
                url_id = row["id"]
                cursor.execute('''
                    UPDATE urls 
                    SET status = ?, 
                        response_time = ?, 
                        last_checked = ?
                    WHERE id = ?
                ''', (result["status"], result["response_time"], datetime.now().isoformat(), url_id))
            
            cursor.execute('''
                INSERT INTO url_checks (url_id, status, response_time, timestamp)
                VALUES (?, ?, ?, ?)
            ''', (url_id, result["status"], result["response_time"], datetime.now().isoformat()))
            
            # Calculate uptime percentage
            cursor.execute('''
                SELECT COUNT(*), SUM(CASE WHEN status = 'UP' THEN 1 ELSE 0 END)
                FROM url_checks 
                WHERE url_id = ?
            ''', (url_id,))
            total_checks, successful_checks = cursor.fetchone()
            
            uptime_percentage = (successful_checks / total_checks) * 100 if total_checks > 0 else 100.0
            
            results.append({
                "url": url,
                "status": result["status"],
                "response_time": result["response_time"],
                "uptime_percentage": uptime_percentage,
                "last_checked": datetime.now().isoformat(),
                "url_id": url_id,
                **({"warning": result["warning"]} if "warning" in result else {})
            })
        
        conn.commit()
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking URLs: {str(e)}")
    finally:
        conn.close()

@app.get("/all-urls/", response_model=List[URLStatusResponse])
async def get_all_urls():
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, url, status, response_time, uptime_percentage, last_checked
            FROM urls
        ''')
        rows = cursor.fetchall()
        
        results = []
        for row in rows:
            results.append({
                "url_id": row["id"],
                "url": row["url"],
                "status": row["status"],
                "response_time": row["response_time"],
                "uptime_percentage": row["uptime_percentage"],
                "last_checked": row["last_checked"]
            })

        return results
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching URLs: {str(e)}")
    finally:
        conn.close()


@app.get("/history/{url_id}")
async def get_history(url_id: int):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT status, response_time, timestamp 
            FROM url_checks 
            WHERE url_id = ? 
            ORDER BY timestamp DESC
        ''', (url_id,))
        checks = cursor.fetchall()
        
        if not checks:
            raise HTTPException(status_code=404, detail="No history found for this URL")
            
        return [{
            "status": check["status"],
            "response_time": check["response_time"],
            "timestamp": check["timestamp"]
        } for check in checks]
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching history: {str(e)}")
    finally:
        conn.close()
