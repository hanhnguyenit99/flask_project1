from app import db
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from flask_login import UserMixin
from app import login
from werkzeug.security import generate_password_hash, check_password_hash





class Users(UserMixin, db.Model):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    username = Column(String(50))
    password = Column(String(255))
    gender = Column(String(11))
    phone = Column(String(50))
    email = Column(String(50))
    posts = relationship('Post', backref='user', lazy=True)
    evaluates = relationship('Evaluate', backref='user', lazy=True)
    houses = relationship('House', backref='user', lazy=True)

    def __repr__(self):
        return '<user {}>'.format(self.id, self.username, self.gender, self.phone, self.email)

    def __init__(self, username, gender, phone, email):
        self.username = username
        self.gender = gender
        self.phone = phone
        self.email = email

    def set_password(self, password):
        #Mã hóa mật khẩu#
        self.password = generate_password_hash(password)

    def check_password(self, password):
        #Mã hóa lại mật khẩu rồi so sánh Đúng(True) Sai(False)#
        return check_password_hash(self.password, password)

    def data(self):
        return {
            'phone': self.phone

        }




class Type(db.Model):
    __tablename__ = "type"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer)
    name = Column(String(50), primary_key=True)

    def __repr__(self):
        return '<type {}>'.format(self.id, self.name)

    def __init__(self, id, name):
        self.id = id
        self.name = name


class House(db.Model):
    __tablename__ = "house"
    __table_args__ = {'extend_existing': True}

    house_id = Column(Integer, primary_key=True)
    name = Column(Integer, ForeignKey(Type.name), nullable=False)
    user_id = Column(Integer, ForeignKey(Users.id), nullable=False)
    area = Column(Float)
    price = Column(Integer)
    number_house = Column(String(20))
    street = Column(String(100))
    wards = Column(String(50))
    district = Column(String(30))
    image = Column(String)
    posts = relationship('Post', backref='house', lazy=True)
    evaluates = relationship('Evaluate', backref='house', lazy=True)
    types = relationship('Type', backref='house', lazy=True)

    def __repr__(self):
        return '<house {}>'.format(self.house_id, self.user_id, self.name, self.area, self.price, self.number_house, self.street, self.wards, self.district, self.image)

    def __init__(self, user_id, name, area, price, number_house, street, wards, district, image):
        self.user_id = user_id
        self.name = name
        self.area = area
        self.price = price
        self.number_house = number_house
        self.street = street
        self.wards = wards
        self.district = district
        self.image = image

    def data(self):
        return {
            'name': self.name,
            'area': self.area,
            'price': self.price,
            'number_house': self.number_house,
            'street': self.street,
            'wards': self.wards,
            'district': self.district,
            'image': self.image
        }



class Post(db.Model):
    __tablename__ = "post"
    __table_args__ = {'extend_existing': True}

    post_id = Column(Integer, primary_key=True)
    describe = Column(String(4000))
    content = Column(String(1000))
    phone = Column(String(50))
    time = Column(DateTime, index=True, default=datetime.utcnow())
    user_id = Column(Integer, ForeignKey(Users.id), nullable=False)
    house_id = Column(Integer, ForeignKey(House.house_id), nullable=False)

    # description

    def __repr__(self):
        return '<post {}>'.format(self.post_id, self.user_id, self.house_id, self.describe, self.content, self.phone, self.time)

    def __init__(self, user_id, house_id, describe, content, phone, time):
        self.user_id = user_id
        self.house_id = house_id
        self.describe = describe
        self.content = content
        self.phone = phone
        self.time = time

    def data(self):
        return {
            'time': self.time,
            'content': self.content,
            'describe': self.describe,
            'phone': self.phone

        }


class Evaluate(db.Model):
    __tablename__ = "evaluate"
    __table_args__ = {'extend_existing': True}

    evaluate_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey(Users.id), nullable=False)
    house_id = Column(Integer, ForeignKey(House.house_id), nullable=False)
    cmt = Column(String(200))



    def __repr__(self):
        return '<like {}>'.format(self.user_id, self.house_id, self.evaluate, self.cmt)

    def __init__(self, user_id, house_id, evaluate, cmt):
        self.user_id = user_id
        self.house_id = house_id
        self.evaluate = evaluate
        self.cmt = cmt

@login.user_loader
def load_user(id):
        return Users.query.get(int(id))


if __name__ == "__main__":
    db.create_all()