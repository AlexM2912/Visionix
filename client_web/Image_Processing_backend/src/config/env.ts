import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  SOAP_WSDL_URL:
    process.env.SOAP_WSDL_URL || "https://visionix-application.up.railway.app/ws/procesamiento?wsdl",
};