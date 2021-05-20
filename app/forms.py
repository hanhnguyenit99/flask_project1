from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, FileField, RadioField
from wtforms.validators import ValidationError, DataRequired, Email, EqualTo
from app.models import *

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember me')
    submit = SubmitField('Login')

class SignUpForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    gender = RadioField('Select your gender :', choices=[('Nam', 'Nam'), ('Nữ', 'Nữ')])
    phone = StringField('phone', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    password2 = PasswordField(
        'Repeat Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('SignUp')

    def validate_username(self, username):
        user = Users.query.filter_by(username=username.data).first()
        if user is not None:
            raise ValidationError('Please use a different username.')

    def validate_email(self, email):
        user = Users.query.filter_by(email=email.data).first()
        if user is not None:
            raise ValidationError('Please use a different email address.')

class EditUserForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    submit = SubmitField('Save')

class PostForm(FlaskForm):
      phone = StringField('Điện Thoại:', validators=[DataRequired()])
      name = RadioField('Chọn loại nhà :', choices=[('Chung cư mini', 'Chung cư mini'), ('Phòng trọ', 'Phòng trọ')])
      area = StringField('Diện tích:', validators=[DataRequired()])
      price = StringField('Giá:', validators=[DataRequired()])
      number_house = StringField('Số nhà:', validators=[DataRequired()])
      street = StringField('Đường:', validators=[DataRequired()])
      wards = StringField('Phường:', validators=[DataRequired()])
      district = StringField('Quận:', validators=[DataRequired()])
      content = StringField('Tiêu đề:', validators=[DataRequired()])
      describe = StringField('Mô tả:', validators=[DataRequired()])
      image = FileField('Ảnh:')

      submit = SubmitField('Submit')
