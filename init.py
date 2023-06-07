from dataclasses import dataclass
from flask import Flask, jsonify,  request, render_template, redirect
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

@app.route('/test',methods=['GET'])
def calc():
    return render_template('test.html')

@app.route('/test.js')
def test_js():
    return render_template('test.js')