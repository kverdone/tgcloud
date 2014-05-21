from flask import Flask, render_template, session, redirect, url_for
from config import recent_entries, word_frequency
from flask.ext.login import LoginManager, login_required, login_user, logout_user
from flask.ext.wtf import Form
from wtforms import TextField, PasswordField, SubmitField
from wtforms.validators import DataRequired
import os

app = Flask(__name__)
lm = LoginManager()
lm.init_app(app)
lm.login_view = 'login'
app.config['SECRET_KEY']=os.environ.get('SECRET_KEY', 'qwerty')

@app.route('/login', methods=['GET', 'POST'])
def login():
  form = LoginForm()
  if form.validate_on_submit():
    email = form.email.data
    password = form.password.data`
    if email:
      if os.environ.get('EMAIL','kyle') == email and os.environ.get('PASS','guest') == password:
        login_user(User())
        return redirect(url_for('index'))
  return render_template('login.html', form=form)

@app.route('/')
@login_required
def index():  
  return render_template('index.html')

@app.route('/cloud/<username>/<num>')
@login_required
def generate(username, num):
  freq = word_frequency(username, num)
  return render_template('cloud.html', username=username, entries=freq)

@app.route('/recent/<username>')
@login_required
def recent(username):
  entries = recent_entries(username)
  return render_template('recent.html', username=username, entries=entries)

@app.route('/logout')
@login_required
def logout():
  logout_user()
  return redirect(url_for('login'))

class User():
  def is_active(self):
    return True

  def get_id(self):
    return unicode('1')

  def is_authenticated(self):
    return True

  def is_anonymous(self):
    return False

@lm.user_loader
def user_loader(user_id):
  return User()

class LoginForm(Form):
  email = TextField('email', validators=[DataRequired()])
  password = PasswordField('password', validators=[DataRequired()])
  submit = SubmitField('Login')

if __name__ == '__main__':
  app.run()
