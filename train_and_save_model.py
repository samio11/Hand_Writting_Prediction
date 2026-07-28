import os
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Dense, Flatten, Input

def train_and_save():
    print("Loading MNIST dataset...")
    (X_train, y_train), (X_test, y_test) = keras.datasets.mnist.load_data()

    print(f"X_train shape: {X_train.shape}")
    
    # Normalize dataset (0 to 1)
    X_train = X_train / 255.0
    X_test = X_test / 255.0

    print("Building model architecture...")
    model = Sequential([
        Input(shape=(28, 28)),
        Flatten(),
        Dense(128, activation="relu"),
        Dense(10, activation="softmax")
    ])

    model.compile(
        loss="sparse_categorical_crossentropy",
        optimizer="adam",
        metrics=["accuracy"]
    )

    print("Training model (10 epochs)...")
    model.fit(X_train, y_train, epochs=10, validation_split=0.2, batch_size=64)

    test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
    print(f"Test Accuracy: {test_acc * 100:.2f}%")

    # Ensure backend directory exists
    os.makedirs("backend", exist_ok=True)
    model_path = os.path.join("backend", "handwriting_model.keras")
    
    print(f"Saving model to {model_path}...")
    model.save(model_path)
    print("Model saved successfully!")

if __name__ == "__main__":
    train_and_save()
