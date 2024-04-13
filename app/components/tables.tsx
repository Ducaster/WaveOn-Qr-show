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
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    axios
      .get("/api/sheet")
      .then((response) => {
        const fetchedData: DataType[] = response.data.data; // API 응답에서 데이터 추출

        if (fetchedData.length > 0) {
          // 컬럼 동적 생성
          const newColumns = Object.keys(fetchedData[0]).map((key) => ({
            title: key.charAt(0).toUpperCase() + key.slice(1), // 키의 첫 문자를 대문자로 변환
            dataIndex: key,
            key: key,
          }));
          setColumns(newColumns); // 컬럼 상태 업데이트
        }

        setData(
          fetchedData.map((item, index) => ({ ...item, key: `key_${index}` }))
        ); // 키 추가
        setLoading(false); // 로딩 상태 해제
      })
      .catch((error) => {
        console.error("There was an error fetching the data:", error);
        setLoading(false); // 에러 발생 시 로딩 상태 해제
      });
  }, []);

  return (
    <Spin spinning={loading}>
      <Table columns={columns} dataSource={data} />
    </Spin>
  );
};

export default Sheet;
