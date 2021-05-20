from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_restful import Api

app = Flask(__name__)
api = Api(app)

app.config['SECRET_KEY'] = 'hanhnguyen!'
# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:@localhost/db_flask'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:@localhost/db_ql'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
db = SQLAlchemy(app=app)

login = LoginManager(app)
login.login_view = 'login'



from app import routes, apis, base_api