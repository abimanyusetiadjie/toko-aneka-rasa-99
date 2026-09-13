from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from services.market_basket import run_market_basket_analysis

app = FastAPI(
    title="Minimarket ML Engine",
    description="Engine khusus untuk Market Basket Analysis menggunakan algoritma FP-Growth",
    version="1.0.0"
)

class AnalysisResponse(BaseModel):
    status: str
    message: str

@app.post("/api/v1/ml/market-basket-analysis", response_model=AnalysisResponse)
def trigger_market_basket_analysis():
    """
    Endpoint ini dirancang untuk dipicu secara otomatis oleh Cron Job (misalnya setiap jam 01.00 atau 02.00 pagi).
    Endpoint ini akan membaca transaksi historis, mencari pola asosiasi, dan menyimpan rule valid ke database.
    Catatan: Saat database masih kosong atau transaksi sedikit, algoritma akan menangani secara gracefully.
    """
    result = run_market_basket_analysis()
    
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result["message"])
        
    return result

@app.get("/")
def root():
    return {"message": "Minimarket ML Engine is running. See /docs for API documentation."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
