import React, { Fragment, useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { colors } from '../../theme/colors';
import { io } from 'socket.io-client';
import * as S from './styles';
import { useDataContext, EMGDataPoint } from '../DataContext';
import axios from 'axios';

interface ChartDataPoint {
  value: number;
  timestamp: number;
  formattedTime: string;
}

const EMGChart = () => {
  const {
    addEmgDataPoint,
    emgData,
    wordEvents,
    addPrediction,
    predictions,
    highlightedWord,
  } = useDataContext();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [maxValue, setMaxValue] = useState(0);
  const dataPointsRef = useRef<EMGDataPoint[]>([]); // To keep track of data points for prediction
  const windowSize = 25; // Size of the sliding window
  const stride = 12; // Stride for the sliding window

  useEffect(() => {
    const socket = io(':3001');

    socket.on('connect', () => {
      console.log(`Connected to server: ${socket.id}`);
    });

    socket.on('serial:data', (newData: string) => {
      const numericValue = parseFloat(newData);
      const newTimestamp = Date.now();
      const formattedTimestamp = new Date(newTimestamp)
        .toISOString()
        .slice(11, 23);

      setChartData((prevData) => {
        const updatedData = [
          ...prevData,
          {
            value: numericValue,
            timestamp: newTimestamp,
            formattedTime: formattedTimestamp,
          },
        ];

        // Keep only the last N data points to avoid excessive memory usage
        return updatedData.slice(-100);
      });

      const newDataPoint = {
        value: numericValue,
        timestamp: newTimestamp,
        formattedTime: formattedTimestamp,
      };

      addEmgDataPoint(newDataPoint);

      // Add to our reference array for prediction
      dataPointsRef.current.push(newDataPoint);

      // Check if we have enough data points to make a prediction
      if (dataPointsRef.current.length >= windowSize) {
        // Get the last windowSize data points
        const dataForPrediction = dataPointsRef.current.slice(-windowSize);

        // Send data to prediction endpoint
        sendDataForPrediction(dataForPrediction);

        // Remove stride number of points from the beginning to implement sliding window
        if (dataPointsRef.current.length >= windowSize + stride) {
          dataPointsRef.current = dataPointsRef.current.slice(stride);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [addEmgDataPoint, windowSize, stride, addPrediction]);

  const sendDataForPrediction = async (dataPoints: EMGDataPoint[]) => {
    try {
      // Extract just the values for prediction
      const values = dataPoints.map((point: EMGDataPoint) => point.value);

      // Send the data to the prediction endpoint
      const response = await axios.post('http://localhost:5000/predict', {
        data: values,
      });

      // Add the prediction to the context
      if (response.data && response.data.prediction !== undefined) {
        addPrediction({
          prediction: response.data.prediction,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error('Error sending data for prediction:', error);
    }
  };

  useEffect(() => {
    const values = chartData.map((d) => d.value);
    const max = Math.max(...values, 0);
    setMaxValue((prev) => (max > prev ? max : prev));
  }, [chartData]);

  const handleDownloadData = () => {
    // Prepare a JSON (or CSV) file with EMG + wordEvents + predictions + highlightedWord
    const dataToExport = {
      emgData,
      wordEvents,
      predictions,
      highlightedWord,
    };

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create a temporary <a> link to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'emg_data.json'); // file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Fragment>
      <S.MaxValue>Valor máximo atingido: {maxValue}</S.MaxValue>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart width={500} height={300} data={chartData}>
          <XAxis dataKey="formattedTime" />
          <YAxis />
          <Line
            type="monotone"
            dataKey="value"
            stroke={colors.blue}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <button onClick={handleDownloadData}>Download Data</button>
    </Fragment>
  );
};

export default EMGChart;
