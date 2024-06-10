from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.preprocessing import StandardScaler
import logging
import pandas as pd
import numpy as np
import pickle

app = Flask(__name__)
scaler = StandardScaler()
CORS(app)

with open('model.pkl', 'rb') as f:
    kmedoids = pickle.load(f)

def safe_float_conversion(value):
    try:
        if value.strip():
            return float(value)
        else:
            return None
    except ValueError:
        return None

def preprocess_data(df: pd.DataFrame):
    df['living_cost_mean'].fillna(df['living_cost_mean'].mean(), inplace=True)
    df['living_cost_stddev'].fillna(df['living_cost_stddev'].mean(), inplace=True)
    df['living_cost'] = df['living_cost_mean'] + df['living_cost_stddev']
    df.drop(columns=['living_cost_mean', 'living_cost_stddev'], inplace=True)
    return df

def scale_data(df: pd.DataFrame):
    df = df.drop(columns=['province', 'year'])
    df = pd.DataFrame(scaler.fit_transform(df), columns=df.columns, index=df.index)
    return df

@app.route('/kmedoids', methods=['POST'])
def fit_data():
    try:
        data = request.get_json()
        x = pd.DataFrame(data['data'])

        columns_to_convert = ['year','health_index','living_cost_mean','living_cost_stddev','polution','crime_rate','purchasing_power']
        for column in columns_to_convert:
            x[column] = x[column].apply(safe_float_conversion)

        x = preprocess_data(x)
        x_scaled = scale_data(x)

        x['year'] = x['year'].astype(int)

        labels = kmedoids.predict(x_scaled)
        mapping = {0: 'High', 1: 'Low', 2: 'Medium'}
        mapped_labels = np.vectorize(mapping.get)(labels)

        x['livability_index'] = mapped_labels
        merged = pd.concat([x, pd.DataFrame(mapped_labels, columns=['livability_index'])], axis=1)

        return jsonify(merged.to_dict(orient='records'))
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True)
