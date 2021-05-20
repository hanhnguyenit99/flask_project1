from flask import jsonify
from app import app
from app.models import *
from flask import request
from werkzeug.security import generate_password_hash

@app.route("/api_base/users", methods=['GET'])
def user_base():
    users = Users.query.all()
    result = []
    for u in users:
        result.append({
            'user_id': u.id,
            'user_name': u.username,
            'user_email': u.email,
           })
    return jsonify({'Users': result})


@app.route("/api_base/users/get/<int:id>", methods=['GET'])
def user_base_get(id):
    user = Users.query.get(id)
    result = {
        'user_id': user.id,
        'username': user.username,
        'email': user.email
    }
    print(user.username)
    return jsonify({'User': result})

@app.route('/api_base/user/create', methods=['POST'])
def user_base_insert():
    username = request.json['username']
    password = request.json['password']
    email = request.json['email']
    new_user = Users(username, email, generate_password_hash(password))
    db.session.add(new_user)
    db.session.commit()
    return "Create New User Success!!!"

@app.route('/api_base/user/update/<id>', methods=['PUT'])
def user_base_update(id):
    user = Users.query.get(id)
    user.username = request.json['username']
    user.password = request.json['password']
    user.email = request.json['email']
    db.session.commit()
    return "Update New User Success!!!"

@app.route('/api_base/user/delete/<id>', methods=['DELETE'])
def user_base_delete(id):
    user = Users.query.get(id)
    db.session.delete(user)
    db.session.commit()
    return "Delete New User Success!!!"

@app.route("/api_base/post", methods=['GET'])
def user_base_data():
    post = Post.query.all()
    result = []
    for u in post:
        result.append({
            'id': u.id,
            'body': u.body,
           })
    return jsonify({'Post': result})

@app.route("/api_base/users/get/<username>", methods=['GET'])
def user_base_gets(username):
    user = Users.query.get(username)
    result = {
        'user_id': user.id,
        'username': user.username,
        'email': user.email
    }
    print(user.username)
    return jsonify({'User': result})




