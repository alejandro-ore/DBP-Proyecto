from dataclasses import dataclass
from flask import Flask, jsonify,  request, render_template, redirect
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)

@dataclass
class Animation(db.Model):
    id: int
    name: str

    id=db.Column(db.Integer,primary_key=True,autoincrement=True)
    name=db.Column(db.Text,nullable=False)

@dataclass
class Frame(db.Model):
    id: int
    data: str
    id_anim: int
    frame_n: int

    id=db.Column(db.Integer,primary_key=True,autoincrement=True)
    data=db.Column(db.Text,nullable=False)
    frame_n=db.Column(db.Integer,nullable=False)
    id_anim=db.Column(db.Integer,db.ForeignKey('animation.id'))
    anim=db.relationship('Animation',backref='frames')


@app.route('/animations',methods=['GET','POST'])
def get_animations():
    if request.method=='GET':
        data=Animation.query.all()
        return jsonify(data)
    if request.method=='POST':
        json=request.get_json()
        frame=Animation(name=json['name'])
        db.session.add(frame)
        db.session.commit()
        return str(frame.id)
    return 'FAILURE'
    
@app.route('/animations/<id>',methods=['GET'])
def get_animation_id(id):
    data=Animation.query.get_or_404(id)
    return jsonify(data)


@app.route('/frames',methods=['GET','POST','PUT'])
def get_frames():
    if request.method=='GET':
        data=Frame.query.all()
        return jsonify(data)
    if request.method=='POST':
        json=request.get_json()
        animation=Animation.query.get_or_404(json['id_anim'])
        frame=Frame(data=json['data'],frame_n=json['frame_n'],anim=animation)
        db.session.add(frame)
        db.session.commit()
        return str(frame.id)
    if request.method=='PUT':
        json=request.get_json()
        frame=Frame.query.get_or_404(json['id'])
        frame.data=json['data']
        db.session.commit()
        return str(frame.id)

@app.route('/frames/<id>',methods=['GET'])
def get_frame_id(id):
    data=Frame.query.get_or_404(id)
    return jsonify(data)

with app.app_context():
    db.drop_all()
    db.create_all()