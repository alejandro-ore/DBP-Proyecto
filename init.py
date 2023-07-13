from dataclasses import dataclass
from flask import Flask, jsonify,  request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)

@dataclass
class User(db.Model):
    email: str
    username: str
    password: str

    email=db.Column(db.Text,primary_key=True)
    username=db.Column(db.Text,nullable=False)
    password=db.Column(db.Text,nullable=False)

@dataclass
class Animation(db.Model):
    id: int
    name: str
    n_frames: int
    email_user: str

    id=db.Column(db.Integer,primary_key=True,autoincrement=True)
    name=db.Column(db.Text,nullable=False)
    n_frames=db.Column(db.Integer,nullable=False,default=1)
    email_user=db.Column(db.Text,db.ForeignKey('user.email'))
    user=db.relationship('User',backref='animations')

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

@app.route('/users',methods=['GET','POST','PUT'])
def get_users():
    if request.method=='GET':
        users=User.query.all()
        return jsonify(users)
    if request.method=='POST':
        json=request.get_json()
        user=User(email=json['email'],username=json['username'],password=json['password'])
        db.session.add(user)
        db.session.commit()
        return json['email']
    if request.method=='PUT':
        pass #TODO
    return 'FAILURE'

@app.route('/users/<email>',methods=['GET'])
def get_user_id(email):
    user=User.query.get(email)
    if user is not None:
        return jsonify(user)
    else:
        return jsonify({'email':'FAILURE'})


@app.route('/animations',methods=['GET','POST','PUT'])
def get_animations():
    if request.method=='GET':
        data=Animation.query.all()
        return jsonify(data)
    if request.method=='POST':
        json=request.get_json()
        user=User.query.get_or_404(json['email_user'])
        frame=Animation(user=user,name=json['name'])
        db.session.add(frame)
        db.session.commit()
        return str(frame.id)
    if request.method=='PUT':
        pass #TODO
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

@app.route('/frames/animations/<id_animation>',methods=['GET'])
def get_frame_by_animation(id_animation):
    data=Frame.query.filter_by(id_anim=id_animation).all()
    return jsonify(data)

with app.app_context():
    db.drop_all()
    db.create_all()
