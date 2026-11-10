"""
AirGuard AI — Database Management & Repository Layer
SQLite engine with strict relational schema designed for turnkey migration to PostgreSQL.
Handles monitoring stations, observations, predictions, explanations, alerts, and authority actions.
"""

import os
import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "airguard.db"))

def get_connection():
    """Returns a SQLite connection with row factory enabling dict-like column access."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes tables with PostgreSQL-compatible data types and foreign key constraints."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Monitoring Stations Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS stations (
        station_id VARCHAR(50) PRIMARY KEY,
        station_name VARCHAR(100) NOT NULL,
        agency VARCHAR(50) NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        station_type VARCHAR(50) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # 2. Air Quality & Weather Observations Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS observations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        station_id VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        pm25 REAL,
        pm10 REAL,
        no2 REAL,
        so2 REAL,
        co REAL,
        o3 REAL,
        temperature REAL,
        humidity REAL,
        wind_speed REAL,
        wind_direction REAL,
        rainfall REAL,
        aqi REAL,
        category VARCHAR(50),
        dominant_pollutant VARCHAR(20),
        data_source VARCHAR(50) DEFAULT 'CPCB_OBSERVATION',
        FOREIGN KEY (station_id) REFERENCES stations (station_id),
        UNIQUE (station_id, timestamp)
    );
    """)
    
    # 3. Forecast Predictions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        station_id VARCHAR(50) NOT NULL,
        forecast_generated_at TIMESTAMP NOT NULL,
        target_timestamp TIMESTAMP NOT NULL,
        horizon_hours INTEGER NOT NULL,
        model_version VARCHAR(50) NOT NULL,
        pm25 REAL,
        pm10 REAL,
        no2 REAL,
        so2 REAL,
        co REAL,
        o3 REAL,
        aqi REAL,
        category VARCHAR(50),
        dominant_pollutant VARCHAR(20),
        FOREIGN KEY (station_id) REFERENCES stations (station_id)
    );
    """)
    
    # 4. Forecast Explanations (SHAP) Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS forecast_explanations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prediction_id INTEGER,
        station_id VARCHAR(50) NOT NULL,
        horizon_hours INTEGER NOT NULL,
        target_pollutant VARCHAR(20) NOT NULL,
        base_value REAL,
        top_factors_json TEXT NOT NULL,
        explanation_summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (station_id) REFERENCES stations (station_id)
    );
    """)
    
    # 5. Authority Interventions & Action Records Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS authority_actions (
        id VARCHAR(50) PRIMARY KEY,
        station_id VARCHAR(50) NOT NULL,
        station_name VARCHAR(100) NOT NULL,
        pollutant VARCHAR(20) NOT NULL,
        action_title VARCHAR(200) NOT NULL,
        action_type VARCHAR(100) NOT NULL,
        department VARCHAR(150) NOT NULL,
        priority VARCHAR(20) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Pending',
        action_notes TEXT,
        action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_date TIMESTAMP,
        pre_intervention_aqi REAL,
        post_intervention_aqi REAL,
        evaluation_notes TEXT,
        FOREIGN KEY (station_id) REFERENCES stations (station_id)
    );
    """)
    
    # 6. Automated Alerts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id VARCHAR(50) PRIMARY KEY,
        station_id VARCHAR(50) NOT NULL,
        station_name VARCHAR(100) NOT NULL,
        alert_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        pollutant VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        forecast_horizon INTEGER,
        predicted_value REAL,
        threshold_value REAL,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (station_id) REFERENCES stations (station_id)
    );
    """)
    
    # 7. Model Metadata Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS model_metadata (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_name VARCHAR(100) NOT NULL,
        pollutant VARCHAR(20) NOT NULL,
        horizon INTEGER NOT NULL,
        mae REAL,
        rmse REAL,
        r2 REAL,
        trained_at TIMESTAMP,
        parameters_json TEXT
    );
    """)
    
    conn.commit()
    conn.close()
    print("Database tables initialized successfully.")

def seed_stations(stations_list: List[Dict[str, Any]]):
    """Seeds monitoring stations if not already present."""
    conn = get_connection()
    cursor = conn.cursor()
    for s in stations_list:
        cursor.execute("""
        INSERT OR IGNORE INTO stations (station_id, station_name, agency, latitude, longitude, station_type, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (s["station_id"], s["name"], s["agency"], s["lat"], s["lon"], s["type"], s.get("description", "")))
    conn.commit()
    conn.close()

def get_all_stations() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stations WHERE is_active = 1")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def get_authority_actions() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM authority_actions ORDER BY action_date DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def create_or_update_action(action_data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO authority_actions (
        id, station_id, station_name, pollutant, action_title, action_type,
        department, priority, severity, status, action_notes, action_date,
        completed_date, pre_intervention_aqi, post_intervention_aqi, evaluation_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        action_notes = excluded.action_notes,
        completed_date = excluded.completed_date,
        post_intervention_aqi = excluded.post_intervention_aqi,
        evaluation_notes = excluded.evaluation_notes
    """, (
        action_data["id"], action_data["station_id"], action_data["station_name"],
        action_data["pollutant"], action_data["action_title"], action_data["action_type"],
        action_data["department"], action_data["priority"], action_data["severity"],
        action_data.get("status", "Pending"), action_data.get("action_notes", ""),
        action_data.get("action_date", datetime.now().isoformat()),
        action_data.get("completed_date", None),
        action_data.get("pre_intervention_aqi", None),
        action_data.get("post_intervention_aqi", None),
        action_data.get("evaluation_notes", "")
    ))
    conn.commit()
    conn.close()
    return action_data

def get_active_alerts() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM alerts ORDER BY created_at DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows
