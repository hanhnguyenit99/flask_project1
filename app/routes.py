from flask import render_template, flash, redirect, url_for, jsonify
from app import app, db
from app.forms import LoginForm, SignUpForm, EditUserForm, PostForm
from app.models import *
from flask_login import current_user, login_user, logout_user, login_required
from flask import request
from werkzeug.urls import url_parse
from datetime import datetime
from werkzeug.utils import secure_filename
from PIL import Image
from sqlalchemy import exc
from werkzeug.security import generate_password_hash
from flask_paginate import Pagination, get_page_parameter


@app.route("/")
@app.route("/login", methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = LoginForm()
    if form.validate_on_submit():
        user = Users.query.filter_by(username=form.username.data).first()
        if user is None or not user.check_password(form.password.data):
            flash('Invalid username or password')
            return redirect(url_for('login'))
        login_user(user, remember=form.remember_me.data)
        next_page = request.args.get('next')
        if not next_page or url_parse(next_page).netloc != '':
            next_page = url_for('index')
        return redirect(next_page)
    return render_template('login.html', title='Sign In', form=form)

@app.route("/index", methods=['GET'])
@login_required
def index():
    id = current_user.get_id()
    load_user(id)
    page_size = request.args.get("page_size", 4, type=int)
    page = request.args.get("page", default=1, type=int)
    district = request.args.get("district", default='', type=str)
    if len(district) > 0:
        posts = House.query.filter(House.district.like(district)).paginate(page=page, per_page=page_size, error_out=True)
        return render_template('index.html', data=posts)
    else:
        posts = House.query.paginate(page=page, per_page=page_size, error_out=True)
        return render_template('index.html', data=posts)

@app.route("/demo")
def demo():
    page_size = request.args.get("page_size", 4, type=int)
    page = request.args.get("page", default=1, type=int)
    district = request.args.get("district", default='', type=str)
    if len(district) > 0:
        posts = House.query.filter(House.district.like(district)).paginate(page=page, per_page=page_size, error_out=True)
        return render_template('demo.html', data=posts)
    else:
        posts = House.query.paginate(page=page, per_page=page_size, error_out=True)
        return render_template('demo.html', data=posts)



@app.route("/data", methods=['GET', 'POST'])
def data():
    form = PostForm()
    time = datetime.now()
    if form.validate_on_submit():
        img = "/assets/images/"+str(form.image.data)
        house = House(user_id=current_user.id, name=form.name.data, area=form.area.data, price=form.price.data,
                      number_house=form.number_house.data, street=form.street.data, wards=form.wards.data,
                      district=form.district.data, image=img)
        db.session.add(house)
        db.session.commit()
        house_id = House.query.order_by(House.house_id.desc()).first()
        print(house_id)
        post = Post(user_id=current_user.id, house_id=int(str(house_id)[7:(len(str(house_id))-1)]),
                    describe=form.describe.data, phone=form.phone.data,
                    content=form.content.data, time=time)
        db.session.add(post)
        db.session.commit()
        flash('Data Up Success!')
        return redirect(url_for('demo'))
    return render_template('data.html', title="Đăng tin" , form=form)


@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('login'))


@app.route('/person', methods=['GET'])
def person():
    return render_template('person.html')


@app.route('/register', methods=['GET', 'POST'])
def signup():
    form = SignUpForm()
    if request.method == 'GET':
        return render_template('signup.html', title='Sign Up', form=form)
    else:
        if current_user.is_authenticated:
            return redirect(url_for('index'))
        if form.validate_on_submit():
            print('OK')
            user = Users(username=form.username.data, email=form.email.data, gender=form.gender.data, phone=form.phone.data)
            user.set_password(form.password.data)
            db.session.add(user)
            db.session.commit()

            flash('Sign Up Success!')
            return redirect(url_for('login'))


@app.route('/edit', methods=['GET', 'POST'])
@login_required
def edit_profile():
    form = EditUserForm()
    if form.validate_on_submit():
        # Update
        current_user.username = form.username.data
        current_user.email = form.email.data
        db.session.commit()
        flash('Edit User Success!')
        return redirect(url_for('edit_profile'))
    elif request.method == 'GET':
        # lấy data ra
        form.username.data = current_user.username
        form.email.data = current_user.email
    return render_template('edit_profile.html', title='Edit Profile', form=form)

@app.route("/user/<username>", methods=['GET'])
@login_required
def user(username):
    user = Users.query.filter_by(username=username).first_or_404(description="Keyword not found")
    return render_template('user.html', title='User Infor', posts=user.posts, user=user)


@app.route("/create", methods=['GET', 'POST'])
def create():
    return render_template('create_user.html')

@app.route("/update/<id>", methods=['GET', 'POST'])
def update(id):
    return render_template('update_user.html', id=id)

@app.route("/delete/<id>", methods=['GET', 'POST'])
def delete(id):
    return render_template('delete_user.html', id=id)


# @app.route("/filter", methods=['GET'])
# def filter_by_district():
#     district = request.args.get('search')
#     search = "%{}%".format(district)
#     house = House.query.filter(House.district.like(search)).all()
#     result = []
#     for h in house:
#         result.append(
#             {
#                 'area': h.area,
#                 'price': h.price,
#                 'street': h.street
#             }
#         )
#
#     return jsonify({"Thông tin": result})














