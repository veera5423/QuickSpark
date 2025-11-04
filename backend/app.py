from flask import Flask, render_template, request, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Change to something secure

# ==============================
# MongoDB Connection
# ==============================
MONGO_URI = "mongodb://localhost:27017/"  # Local MongoDB connection
client = MongoClient(MONGO_URI)
db = client['QuickSparkDB']        # Database name
users_collection = db['users']     # Collection name

# ==============================
# Routes
# ==============================

@app.route('/')
def home():
    if 'user_id' in session:
        return render_template('home.html', username=session['username'])
    return redirect(url_for('login'))


# -------- Register User --------
from bson.objectid import ObjectId

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        identifier = request.form['identifier']  # ✅ can be email or phone
        password = request.form['password']

        # Check if input is email or phone
        if '@' in identifier:
            user = users_collection.find_one({'email': identifier})
        else:
            user = users_collection.find_one({'phone': identifier})

        if user and check_password_hash(user['password'], password):
            session['user_id'] = str(user['_id'])
            session['username'] = user['username']
            flash('✅ Login successful!', 'success')
            return redirect(url_for('home'))
        else:
            flash('❌ Invalid email/phone or password.', 'danger')

    return render_template('login.html')


# -------- Login User --------
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        user = users_collection.find_one({'email': email})

        if user and check_password_hash(user['password'], password):
            session['user_id'] = str(user['_id'])
            session['username'] = user['username']
            flash('✅ Login successful!', 'success')
            return redirect(url_for('home'))
        else:
            flash('❌ Invalid email or password.', 'danger')

    return render_template('login.html')


# -------- Logout User --------
@app.route('/logout')
def logout():
    session.clear()
    flash('👋 You have been logged out.', 'info')
    return redirect(url_for('login'))


# ==============================
# Run App
# ==============================
if __name__ == '__main__':
    app.run(debug=True)
