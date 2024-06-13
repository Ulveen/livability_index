from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
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

def preprocess(df: pd.DataFrame) -> pd.DataFrame:
    provinces = df['province']
    years = df['year']
    df = df.drop(columns=['province', 'year'])
    df = pd.DataFrame(scaler.fit_transform(df), columns=df.columns)

    n_components = 1
    pca = PCA(n_components=n_components)
    df = pd.DataFrame(pca.fit_transform(df), columns=['PC' + str(i) for i in range(1, n_components + 1)])

    df['province'] = provinces
    df['year'] = years

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
        
        x['living_cost'] = x['living_cost_mean'] + x['living_cost_stddev']
        x = x.drop(columns=['living_cost_mean', 'living_cost_stddev'])
        x['living_cost'] = x['living_cost'].fillna(x['living_cost'].mean())

        x_copy = preprocess(x)
        x_copy['year'] = x_copy['year'].astype(int)

        labels = kmedoids.predict(x_copy.drop(columns=['province', 'year']))
        mapping = {0: 'Medium', 1: 'High', 2: 'Low'}
        mapped_labels = np.vectorize(mapping.get)(labels)

        x['livability_index'] = mapped_labels
        merged = pd.concat([x, pd.DataFrame(mapped_labels, columns=['livability_index'])], axis=1)
        print(merged)

        return jsonify(merged.to_dict(orient='records'))
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True)
