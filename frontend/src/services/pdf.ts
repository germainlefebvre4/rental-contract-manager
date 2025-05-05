import { jsPDF } from "jspdf";
import { ContractPDFData } from "../types";
import { formatCurrency } from "../utils/formatters";

export const generatePDF = (contractData: ContractPDFData): void => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Helper for centering text
    const centerText = (text: string, y: number, fontSize: number = 12) => {
        doc.setFontSize(fontSize);
        const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
        const x = (pageWidth - textWidth) / 2;
        doc.text(text, x, y);
    };
    
    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    centerText("RENTAL CONTRACT", 20, 20);
    
    // Contract ID and Date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Contract #: ${contractData.contractId}`, 20, 30);
    doc.text(`Date: ${contractData.currentDate}`, pageWidth - 60, 30);
    doc.text(`City: ${contractData.city}`, pageWidth - 60, 35);
    
    // Separator line
    doc.setDrawColor(0, 0, 0);
    doc.line(20, 40, pageWidth - 20, 40);
    
    // Sections - Product details
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("1. PRODUCT INFORMATION", 20, 50);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Object: ${contractData.object}`, 25, 60);
    doc.text(`Brand: ${contractData.brand}`, 25, 65);
    doc.text(`Model: ${contractData.model}`, 25, 70);
    doc.text(`Description: ${contractData.description}`, 25, 75);
    doc.text(`Precautions: ${contractData.precautions}`, 25, 80);
    
    // Renter information
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("2. RENTER INFORMATION", 20, 90);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${contractData.renterName}`, 25, 100);
    doc.text(`Email: ${contractData.renterEmail}`, 25, 105);
    doc.text(`Phone: ${contractData.renterPhone}`, 25, 110);
    doc.text(`Address: ${contractData.renterAddress}`, 25, 115);
    doc.text(`City: ${contractData.renterCity}`, 25, 120);
    
    // Rental terms
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("3. RENTAL TERMS", 20, 130);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Rental Period: ${contractData.usageDate}`, 25, 140);
    doc.text(`Return Date: ${contractData.retrievalDates}`, 25, 145);
    doc.text(`Price per Day: ${formatCurrency(contractData.pricePerDay)}`, 25, 150);
    doc.text(`Price per Week: ${formatCurrency(contractData.pricePerWeek)}`, 25, 155);
    doc.text(`Security Deposit: ${formatCurrency(contractData.deposit)}`, 25, 160);
    doc.text(`Total Rental Amount: ${formatCurrency(contractData.totalAmount)}`, 25, 165);
    
    // Product condition
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("4. PRODUCT CONDITION", 20, 175);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Condition at Rental Start: ${contractData.stateBefore}`, 25, 185);
    doc.text(`Condition at Return: ${contractData.stateAfter || '___________________'}`, 25, 190);
    
    // Signature box
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("5. SIGNATURES", 20, 205);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Renter Signature:", 25, 215);
    doc.text("Date:", 25, 225);
    doc.text("Owner Signature:", pageWidth/2 + 10, 215);
    doc.text("Date:", pageWidth/2 + 10, 225);
    
    // Signature boxes
    doc.rect(25, 217, 60, 20); // Renter signature box
    doc.rect(pageWidth/2 + 10, 217, 60, 20); // Owner signature box
    
    // Footer with terms
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("By signing this contract, the renter agrees to take full responsibility for the rented item(s) and return them in the same condition.", 20, 250);
    doc.text(`Contract generated on ${contractData.currentDate} - Rent4Goods`, 20, 255);
    
    // Save the PDF
    doc.save(`rental_contract_${contractData.contractId}.pdf`);
};