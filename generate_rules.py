import json
import pandas as pd
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import fpgrowth, association_rules
import mysql.connector
import os
import sys

# Specify the path to transactions.json
json_path = os.path.join('EDUVERS', 'storage', 'app', 'private', 'transactions.json')

# Load interaction data
with open(json_path, 'r') as f:
    transactions = json.load(f)

te = TransactionEncoder()
te_ary = te.fit(transactions).transform(transactions)
df = pd.DataFrame(te_ary, columns=te.columns_)

# Extract frequent itemsets
frequent_itemsets = fpgrowth(df, min_support=0.1, use_colnames=True)
rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.3)

print(rules)
print("Number of rules:", len(rules))

# Database connection (update credentials as needed)
try:
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',  # Update with your credentials
        database='junior'  # Update with your database name
    )
    cursor = conn.cursor()

    # Create the rules table if it doesn't exist
    try:
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS recommendation_rules (
            id INT AUTO_INCREMENT PRIMARY KEY,
            antecedents VARCHAR(255),
            consequents VARCHAR(255),
            support FLOAT,
            confidence FLOAT
        )
        """)
        print("Table created or already exists.")
    except Exception as e:
        print("Error creating table:", e)
        sys.exit(1)

    # Delete old rules
    try:
        cursor.execute("DELETE FROM recommendation_rules")
        print("Old rules deleted.")
    except Exception as e:
        print("Error deleting old rules:", e)
        sys.exit(1)

    # Insert new rules
    try:
        for _, row in rules.iterrows():
            cursor.execute(
                "INSERT INTO recommendation_rules (antecedents, consequents, support, confidence) VALUES (%s, %s, %s, %s)",
                (','.join(map(str, row['antecedents'])), ','.join(map(str, row['consequents'])), row['support'], row['confidence'])
            )
        conn.commit()
        print("Rules inserted successfully.")
    except Exception as e:
        print("Error inserting rules:", e)
        sys.exit(1)

    cursor.close()
    conn.close()
except Exception as e:
    print("Database connection or execution error:", e)
    sys.exit(1) 