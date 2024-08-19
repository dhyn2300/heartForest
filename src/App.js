import React, { useState } from 'react';
import './index.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handlePrediction = async () => {
    if (!selectedFile) {
      alert('파일을 선택해주세요');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress("예측 중...");

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/predict', {
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
      {/* 네비게이션 바 */}
      <nav className="bg-sagee pt-3 pb-4 pl-5 text-beigee font-bold font-sans text-3xl">
        Heart Forest
      </nav>

      {/* 메인 콘텐츠 */}
      <div className='bg-beigee min-h-screen'>
        <h1 className="font-bold text-green-800 pl-14 pt-14 pb-5 text-6xl leading-snug ">뇌파에 따른 감정 분석하기.</h1>
        
        {/* 파일 선택과 선택된 파일명을 한 줄에 배치 */}
        <div className="flex items-center ml-14 mt-5">
          {/* 커스터마이징된 파일 업로드 버튼 */}
          <label className="text-lg cursor-pointer flex items-center text-beigee bg-sagee">
            <span className="py-3 pl-4 my-2 text-beigee font-bold">
              뇌파 파일 선택( .csv )  
            </span>
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="ml-4 text-lg text-beigee font-bold pr-4">
              {selectedFile ? `선택된 파일: ${selectedFile.name}` : "선택된 파일 없음"}
            </p>
          </label>
        </div>

        {/* 버튼들 */}
        <div className="flex ml-14 mt-4 space-x-4">
          <button
            onClick={handlePrediction}
            className="text-lg cursor-pointer flex items-center text-beigee bg-sagee px-4 py-4 font-bold hover:bg-green-700"
          >
            값 1개 랜덤 예측
          </button>
          <button
            onClick={handleEvaluation}
            className="text-lg cursor-pointer flex items-center text-beigee bg-sagee px-4 py-4 font-bold hover:bg-green-700"
          >
            전체 데이터셋 평가
          </button>
        </div>

        {loading && <p className=" mt-4 text-xl">{progress}</p>}
        {error && <p className=" mt-4 text-red-500 text-xl">{error}</p>}
        {predictionResult && (
          <div className=" text-center mt-10">
            <p className=" text-8xl mb-8">{predictionResult.emoji}</p>
            <p className=" text-2xl font-bold">{predictionResult.correct} !</p>
            <p className=" text-2xl">사용자 {predictionResult.index}:</p>
            <p className=" text-2xl">예측된 감정: {predictionResult.prediction}</p>
            <p className=" text-2xl">실제 감정: {predictionResult.actual}</p>
            
          </div>
        )}
        {evaluationResult && (
          <div className="text-center mt-10 border-t border-dashed ">
            <h2 className="text-2xl font-bold mt-8">전체 데이터셋 평가 결과</h2>
            {evaluationResult.map((item, index) => (
              <div key={index} className="mt-4 text-xl">
                <p>사용자 {item.index}: 예측된 감정: {item.predicted} - 실제 감정: {item.actual} ({item.correct})</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
