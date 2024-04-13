import { NextRequest, NextResponse } from "next/server";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

//sheet 불러오기
async function loadGoogleDoc() {
  try {
    const key = process.env.REACT_APP_GOOGLE_PRIVATE_KEY;
    const serviceAccountAuth = new JWT({
      key: key,
      email: process.env.REACT_APP_GOOGLE_API_EMAIL,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const doc = new GoogleSpreadsheet(
      process.env.REACT_APP_GOOGLE_SHEETS_ID || "",
      serviceAccountAuth
    );
    await doc.loadInfo();
    return doc;
  } catch (error) {
    console.log(error);
  }
}

export async function GET() {
  try {
    // 문서 로드
    const doc = await loadGoogleDoc();
    if (!doc) {
      return NextResponse.json(
        { error: "Failed to load document" },
        { status: 500 }
      );
    }

    // 시트 선택
    const sheet = doc.sheetsByTitle["현황 수식의 사본"];
    if (!sheet) {
      return NextResponse.json({ error: "Sheet not found" }, { status: 404 });
    }

    // 셀 범위 로드
    await sheet.loadCells("B17:G26");

    // 데이터 읽기
    const data = [];
    for (let row = 16; row < 26; row++) {
      const rowData = [];
      for (let col = 1; col < 7; col++) {
        const cell = sheet.getCell(row, col);
        rowData.push(cell.value);
      }
      data.push(rowData);
    }

    const jsonResult = transformDataToJSON(data);
    return NextResponse.json(
      { success: true, data: jsonResult },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error accessing spreadsheet:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function transformDataToJSON(data: any[]) {
  const keys = data[0]; // 첫 번째 행은 키 배열
  const jsonData: Record<string, any>[] = [];

  // 첫 번째 행에서 날짜 열 변환
  for (let j = 1; j < keys.length; j++) {
    keys[j] = excelDateToJSDate(keys[j]).toISOString().split("T")[0];
  }

  // 나머지 데이터 행 처리
  for (let i = 1; i < data.length; i++) {
    const obj: Record<string, any> = {}; // Explicitly define the type of obj
    for (let j = 0; j < data[i].length; j++) {
      // 숫자 데이터 백분율로 변환
      if (typeof data[i][j] === "number") {
        obj[keys[j]] = `${(data[i][j] * 100).toFixed(1)}%`;
      } else {
        obj[keys[j]] = data[i][j];
      }
    }
    jsonData.push(obj);
  }

  return jsonData;
}

function excelDateToJSDate(serial: number) {
  const utc_days = Math.floor(serial - 25569);

  return new Date(utc_days * 86400000);
}
