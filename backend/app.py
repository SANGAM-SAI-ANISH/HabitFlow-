from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Database Configuration
db_path = os.path.join(app.instance_path, 'pulse.db')
try:
    os.makedirs(app.instance_path)
except OSError:
    pass

app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- DATABASE MODEL ---
class Habit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    target = db.Column(db.Integer, default=30)  # Stores your custom target
    progress = db.Column(db.Integer, default=0) 
    completed_today = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        # Calculate percentage based on YOUR custom target
        percentage = int((self.progress / self.target) * 100) if self.target > 0 else 0
        return {
            "id": self.id,
            "name": self.name,
            "target": self.target,
            "progress": self.progress,
            "completed_today": self.completed_today,
            "percentage": min(percentage, 100)
        }

# Create Database
with app.app_context():
    db.create_all()

# --- API ROUTES ---

@app.route('/habits', methods=['GET'])
def get_habits():
    habits = Habit.query.all()
    return jsonify([h.to_dict() for h in habits])

@app.route('/habits', methods=['POST'])
def add_habit():
    data = request.json
    # Logic: Use the target provided by user, otherwise default to 30
    user_target = data.get('target')
    final_target = int(user_target) if user_target else 30

    new_habit = Habit(
        name=data['name'],
        target=final_target
    )
    db.session.add(new_habit)
    db.session.commit()
    return jsonify(new_habit.to_dict())

@app.route('/habits/<int:id>/check', methods=['PUT'])
def check_habit(id):
    habit = Habit.query.get_or_404(id)
    # Allow marking multiple times until final target is reached.
    if habit.progress < habit.target:
        habit.progress += 1
    # keep completed_today for compatibility but do not block repeated marks
    habit.completed_today = False
    db.session.commit()
    return jsonify(habit.to_dict())

@app.route('/habits/<int:id>/reset', methods=['PUT'])
def reset_habit(id):
    habit = Habit.query.get_or_404(id)
    # Reset progress back to start and clear today's completion
    habit.progress = 0
    habit.completed_today = False
    db.session.commit()
    return jsonify(habit.to_dict())

@app.route('/habits/<int:id>', methods=['DELETE'])
def delete_habit(id):
    habit = Habit.query.get_or_404(id)
    db.session.delete(habit)
    db.session.commit()
    return jsonify({"message": "Deleted"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)