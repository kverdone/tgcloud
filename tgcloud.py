from flask import Flask, render_template
from config import query
app = Flask(__name__)

@app.route('/')
def home():
  return render_template('index.html')

@app.route('/user/<username>')
def cloud(username):
  return render_template('user.html', username=username.lower())

@app.route('/recent/<username>')
def recent(username):
  entries = query(username)
  return render_template('recent.html', username=username, entries=entries)

if __name__ == '__main__':
  app.run(debug=True)
