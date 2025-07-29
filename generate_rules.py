import json
import pandas as pd
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import fpgrowth, association_rules
import mysql.connector
import os
import sys
from pathlib import Path

# Specify the path to transactions.json - Fixed path
json_path = os.path.join('EDUVERS', 'storage', 'app', 'transactions.json')

# Check if file exists
if not os.path.exists(json_path):
    print(f"Error: transactions.json not found at {json_path}")
    print("Please run the export endpoint first: /export-user-courses")
    sys.exit(1)

try:
    # Load interaction data
    with open(json_path, 'r') as f:
        transactions = json.load(f)
    
    if not transactions:
        print("Error: No transaction data found in the file")
        sys.exit(1)
    
    print(f"Loaded {len(transactions)} transactions")
    
    te = TransactionEncoder()
    te_ary = te.fit(transactions).transform(transactions)
    df = pd.DataFrame(te_ary, columns=te.columns_)
    
    print(f"DataFrame shape: {df.shape}")
    
    # Extract frequent itemsets
    frequent_itemsets = fpgrowth(df, min_support=0.1, use_colnames=True)
    rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.3)
    
    print(f"Generated {len(rules)} rules")
    print(rules.head())
    
    # Database connection configuration
    # You can set these as environment variables or update them here
    DB_CONFIG = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', ''),
        'database': os.getenv('DB_NAME', 'junior')
    }
    
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Create the rules table if it doesn't exist
        try:
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS recommendation_rules (
                id INT AUTO_INCREMENT PRIMARY KEY,
                antecedents VARCHAR(255),
                consequents VARCHAR(255),
                support FLOAT,
                confidence FLOAT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
            """)
            print("Table created or already exists.")
        except Exception as e:
            print(f"Error creating table: {e}")
            sys.exit(1)
        
        # Delete old rules
        try:
            cursor.execute("DELETE FROM recommendation_rules")
            print("Old rules deleted.")
        except Exception as e:
            print(f"Error deleting old rules: {e}")
            sys.exit(1)
        
        # Insert new rules
        try:
            for _, row in rules.iterrows():
                antecedents_str = ','.join(map(str, row['antecedents']))
                consequents_str = ','.join(map(str, row['consequents']))
                
                cursor.execute(
                    "INSERT INTO recommendation_rules (antecedents, consequents, support, confidence) VALUES (%s, %s, %s, %s)",
                    (antecedents_str, consequents_str, float(row['support']), float(row['confidence']))
                )
            conn.commit()
            print(f"Successfully inserted {len(rules)} rules into database.")
        except Exception as e:
            print(f"Error inserting rules: {e}")
            conn.rollback()
            sys.exit(1)
        
        cursor.close()
        conn.close()
        print("Database connection closed successfully.")
        
    except mysql.connector.Error as e:
        print(f"Database connection error: {e}")
        print("Please check your database configuration:")
        print(f"Host: {DB_CONFIG['host']}")
        print(f"User: {DB_CONFIG['user']}")
        print(f"Database: {DB_CONFIG['database']}")
        sys.exit(1)
        
except Exception as e:
    print(f"General error: {e}")
    sys.exit(1) 