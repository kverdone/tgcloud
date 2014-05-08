from flask import Flask, render_template
from config import query,wordlist
app = Flask(__name__)

@app.route('/')
def home():
  return render_template('index.html')

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

if __name__ == '__main__':
  app.run(debug=True)
