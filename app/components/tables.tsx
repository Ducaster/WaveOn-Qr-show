import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";

interface DataType {
  key: string;
  [key: string]: any; // 동적 키를 위한 인덱스 시그니처
}

const Sheet: React.FC = () => {
  const [data, setData] = useState<DataType[]>([]);
  const [columns, setColumns] = useState<ColumnsType<DataType>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/sheet")
      .then((response) => {
        console.log("API Response:", response.data);

        // 데이터 구조에 따라 적절히 변환
        let fetchedData = response.data;
        if (!Array.isArray(fetchedData)) {
          // 데이터가 객체 혹은 다른 형태로 오는 경우, 배열로 변환하는 로직
          fetchedData = Object.values(fetchedData); // 예: 객체의 값들을 배열로 변환
        }

        if (Array.isArray(fetchedData) && fetchedData.length > 0) {
          const newColumns = Object.keys(fetchedData[0]).map((key) => ({
            title: key,
            dataIndex: key,
            key: key,
            render: (text: any) =>
              typeof text === "number" ? `${text.toFixed(1)}%` : text,
          }));
          setColumns(newColumns);

          const dataWithKey = fetchedData.map((item, index) => ({
            ...item,
            key: `key_${index}`,
          }));

          setData(dataWithKey);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was an error fetching the data:", error);
        setLoading(false);
      });
  }, []);

  return (
    <Spin spinning={loading}>
      <Table columns={columns} dataSource={data} />
    </Spin>
  );
};

export default Sheet;
