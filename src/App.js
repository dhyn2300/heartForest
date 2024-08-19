import React, { useState } from 'react';
import './index.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [evaluationResult, setEvaluationResult] = useState(null);  // 전체 평가 결과를 위한 상태 추가
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState("");

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handlePrediction = async () => {
    if (!selectedFile) {
      alert('파일을 선택하세요!');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress("예측 중...");

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/predict', {  // Flask 서버로 요청을 보냅니다.
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('서버 오류: ' + response.statusText);
      }

      const data = await response.json();
      setPredictionResult(data);
      setProgress("");  // 예측 완료 후 진행 상태 초기화
    } catch (error) {
      console.error('예측 요청 중 오류:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluation = async () => {
    setLoading(true);
    setError(null);
    setProgress("");
    setEvaluationResult(null);  // 새 평가 시작 시 이전 결과 초기화

    try {
      const response = await fetch('http://localhost:5000/evaluate');
      if (!response.ok) {
        throw new Error('서버 오류: ' + response.statusText);
      }

      const data = await response.json();
      setEvaluationResult(data.details);
      setProgress("평가 완료");
    } catch (error) {
      console.error("평가 중 오류:", error);
      setError("평가 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1 className="text-3xl font-bold text-blue-500 text-center mt-10">감정 예측</h1>
      <input
        type="file"
        onChange={handleFileChange}
        className="block mx-auto my-4"
      />
      <button
        onClick={handlePrediction}
        className="bg-blue-500 text-white font-bold py-2 px-4 rounded block mx-auto"
      >
        값 1개 랜덤 예측
      </button>
      <button
        onClick={handleEvaluation}
        className="bg-green-500 text-white font-bold py-2 px-4 rounded block mx-auto mt-4"
      >
        전체 데이터셋 평가
      </button>
      {loading && <p className="text-center mt-4">{progress}</p>}
      {error && <p className="text-center mt-4 text-red-500">{error}</p>}
      {predictionResult && (
        <div className="text-center mt-10">
          <p className="text-xl">예측된 감정: {predictionResult.prediction}</p>
          <p className="text-xl">실제 감정: {predictionResult.actual}</p>
          <p className="text-xl">{predictionResult.correct}</p>
        </div>
      )}
      {evaluationResult && (
        <div className="text-center mt-10">
          <h2 className="text-2xl font-bold">전체 데이터셋 평가 결과</h2>
          {evaluationResult.map((item, index) => (
            <div key={index} className="mt-2">
              <p>사용자 {item.index}: 예측된 감정: {item.predicted} - 실제 감정: {item.actual} ({item.correct})</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
