from flask import Flask, render_template
app = Flask(__name__)

@app.route('/')
def home():
  return render_template('index.html')

@app.route('/user/<username>')
def cloud(username):
  return render_template('user.html', username=username.lower())


if __name__ == '__main__':
  app.run(debug=True)
