from flask import Flask, render_template, session, redirect, url_for
from config import query,wordlist

app = Flask(__name__)

@app.route('/')
def home():
  return render_template('index.html')

@app.route('/cloud/<username>/<num>')
def generate(username, num):
  freq = word_frequency(username, num)
  return render_template('cloud.html', username=username, entries=freq)

@app.route('/recent/<username>')
def recent(username):
  entries = recent_entries(username)
  return render_template('recent.html', username=username, entries=entries)

if __name__ == '__main__':
  app.run()
