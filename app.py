from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import os
import pandas as pd
import numpy as np
from tensorflow.keras.models import load_model
import random

app = Flask(__name__)
CORS(app)

# 모델 및 CSV 파일 로딩
model_path = 'models/best_lstm_model.keras'
csv_path = 'models/emotions.csv'

# 모델과 데이터 로딩
try:
    model = load_model(model_path)
    df = pd.read_csv(csv_path)
except Exception as e:
    print(f"모델 또는 데이터 로딩 중 오류 발생: {e}")
    raise

@app.route('/')
def home():
    return "Flask server is running."

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # 랜덤으로 데이터 선택
        random_index = random.randint(0, len(df) - 1)
        selected_row = df.iloc[random_index]

        # 입력 데이터 전처리
        X_input = np.array([selected_row.drop('label').values], dtype=np.float32)
        X_input = X_input.reshape((1, X_input.shape[1], 1))  # 모델 입력에 맞게 데이터 형태 조정

        # 모델 예측
        prediction = model.predict(X_input)
        predicted_class = np.argmax(prediction, axis=1)

        # 예측 결과 해석 및 한국어 번역
        if predicted_class[0] == 0:
            result = "부정적"
            emoji = "😢"
        elif predicted_class[0] == 1:
            result = "중립적"
            emoji = "😐"
        else:
            result = "긍정적"
            emoji = "😊"

        # 실제 감정 번역
        actual_label = selected_row['label']
        if actual_label == "NEGATIVE":
            actual_result = "부정적"
        elif actual_label == "NEUTRAL":
            actual_result = "중립적"
        else:
            actual_result = "긍정적"

        # 예측이 올바른지 확인
        correct_message = "올바른 예측" if result == actual_result else "잘못된 예측"

        return jsonify({
            'index': random_index,
            'prediction': result,
            'actual': actual_result,
            'correct': correct_message,
            'emoji': emoji
        })

    except Exception as e:
        print(f"예측 중 오류 발생: {e}")
        return jsonify({'error': f'예측 중 오류가 발생했습니다: {str(e)}'}), 500

@app.route('/evaluate', methods=['GET'])
def evaluate():
    try:
        batch_size = 64  # 한 번에 처리할 배치 크기
        total_predictions = len(df)
        X_data = df.drop(columns=['label']).values
        X_data = X_data.reshape((X_data.shape[0], X_data.shape[1], 1))
        Y_data = df['label'].values

        detailed_results = []

        for i in range(0, total_predictions, batch_size):
            end_index = min(i + batch_size, total_predictions)
            X_batch = X_data[i:end_index]
            Y_batch = Y_data[i:end_index]

            predictions = model.predict(X_batch)
            predicted_classes = np.argmax(predictions, axis=1)

            for j in range(len(Y_batch)):
                actual_label = Y_batch[j]
                predicted_class = predicted_classes[j]

                # 실제 및 예측 결과 번역
                if actual_label == "NEGATIVE":
                    actual_result = "부정적"
                elif actual_label == "NEUTRAL":
                    actual_result = "중립적"
                else:
                    actual_result = "긍정적"

                if predicted_class == 0:
                    predicted_result = "부정적"
                elif predicted_class == 1:
                    predicted_result = "중립적"
                else:
                    predicted_result = "긍정적"

                is_correct = (actual_result == predicted_result)
                correct_message = "올바른 예측" if is_correct else "잘못된 예측"

                detailed_results.append({
                    'index': i + j,
                    'actual': actual_result,
                    'predicted': predicted_result,
                    'correct': correct_message
                })

        return jsonify({'details': detailed_results})

    except Exception as e:
        print(f"평가 중 오류 발생: {e}")
        return jsonify({'error': f'평가 중 오류가 발생했습니다: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
