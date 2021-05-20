from flask import jsonify, Blueprint
from app import app, db, api
from flask_restful import Resource
from flask.views import MethodView
from app.models import *
from flask_login import current_user, login_user, logout_user, login_required

userApi = Blueprint('userApi', __name__)

class UsersApi (Resource):

    def get(self):
        users = Users.query.all()
        result = []
        for u in users:
            result.append({
                'user_id': u.id,
                'user_name': u.username,
                'user_email': u.email
            })
        return jsonify({'Users': result})

    # def get(self, id):
    #     user = Users.query.get(id)
    #     result = {'id': user.id, 'username': user.username, 'email': user.email}
    #     return jsonify({'User': result})

    # def get(self, name):
    #     users = Users.query.filter_by(username=name).first_or_404(description="Keyword not found")
    #     result = {'id': users.id, 'username': users.username, 'email': users.email}
    #     return jsonify({"User": result})

    def post(self):
        pass

    def put(self):
        pass

    def delete(self):
        pass

class PostApi(Resource):
    def get(self):
        posts = Post.query.all()
        result = []
        for p in posts:
            result.append({
                'id': p.id,
                'body': p.body,
                'user_id': p.user.id,
                'user_name': p.user.username,
                'user_email': p.user.email
            })
        return jsonify({'Posts': result})

    # def get(self, id):
    #     post = Post.query.get(id)
    #     result = {'id': post.id, 'body': post.body}
    #     return jsonify({'Post': result})

    # def get(self, user_id):
    #     post = Post.query.filter_by(user_id=user_id).first_or_404(description="Keyword not found")
    #     result = {'id': post.id, 'body': post.body, 'username': post.user.username}
    #     return jsonify({"User": result})

api.add_resource(
    UsersApi,
    '/api/user',
    "/api/user/<int:id>",
    "/api/user/find/<string:name>"
)

api.add_resource(
    PostApi,
    '/api/post',
    '/api/post/<int:id>',
    '/api/post/find/<int:user_id>',
)
