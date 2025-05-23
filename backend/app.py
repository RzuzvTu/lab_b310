from flask import Flask
from flask_cors import CORS
from controllers.reservation_controller import reservation_bp
from controllers.date_controller import date_bp
from controllers.user_controllers import user_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(reservation_bp, url_prefix="/reservations")
app.register_blueprint(date_bp, url_prefix="/date")
app.register_blueprint(user_bp, url_prefix="/users")


if __name__ == "__main__":
    app.run(debug=True) 