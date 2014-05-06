from flask import Flask
app = Flask(__name__)

@app.route('/')
def home():
  return 'Empty Home Page'

@app.route('/user/<username>')
def cloud(username):
  return 'Future word cloud for {0}.'.format(username)


if __name__ == '__main__':
  app.run(debug=True)
