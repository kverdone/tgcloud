from flask import Flask, render_template, session, redirect, url_for
from config import query,wordlist
from flask.ext.wtf import Form
from wtforms import StringField, SubmitField
from wtforms.validators import Required
from flask.ext.bootstrap import Bootstrap


app = Flask(__name__)
bootstrap = Bootstrap(app)
app.config['SECRET_KEY'] = 'qwertyuiopasdfghjklzxcvbnm'

@app.route('/', methods=['GET','POST'])
def home():
  form = NameForm()
  print session.get('name')
  if form.validate_on_submit():
    session['name'] = form.name.data
    print session.get('name')
    return redirect(url_for('home'))
  return render_template('index.html', form=form, name=session.get('name'))

@app.route('/user/<username>')
def mycloud(username):
  return render_template('user.html', username=username.lower())

@app.route('/recent/<username>')
def recent(username):
  entries = query(username)
  return render_template('recent.html', username=username, entries=entries)

@app.route('/cloud/<username>')
def jdcloud(username):
  dict = wordlist(username)
  return render_template('jdcloud.html', username=username, entries=dict)

@app.route('/<username>')
def cloud(username):
  dict = wordlist(username)
  return render_template('cloud.html', username=username, entries = dict)

class NameForm(Form):
  name = StringField('What is your name?', validators=[Required()])
  submit = SubmitField('Submit')


if __name__ == '__main__':
  app.run(debug=True)
