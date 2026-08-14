import { jsPDF } from "jspdf";
import { ContractPDFData } from "../types";
import { formatCurrency } from "../utils/formatters";

// Function to load an image as base64
const loadImageAsBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
    });
};

export const generatePDF = async (contractData: ContractPDFData): Promise<void> => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Define column widths and positions
    const marginX = 15;
    const columnWidth = (pageWidth - 4 * marginX) / 3;
    const leftColumnX = marginX;
    const centerColumnX = marginX + columnWidth + marginX;
    const rightColumnX = marginX + 2 * (columnWidth + marginX);
    
    // Color scheme - minimalist grays
    const primaryColor: [number, number, number] = [64, 64, 64]; // Dark gray
    const secondaryColor: [number, number, number] = [128, 128, 128]; // Medium gray
    const lightColor: [number, number, number] = [245, 245, 245]; // Light gray
    const accentColor: [number, number, number] = [41, 128, 185]; // Blue accent
    
    // Try to add logo at the top center
    try {
        const logoBase64 = await loadImageAsBase64('/logo.png');
        doc.addImage(logoBase64, 'PNG', pageWidth/2 - 15, 10, 30, 15);
    } catch (error) {
        console.warn("Logo could not be loaded, using text instead:", error);
        // Fallback to styled text header
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        const logoText = "Rent4Goods";
        const logoWidth = doc.getStringUnitWidth(logoText) * 24 / doc.internal.scaleFactor;
        doc.text(logoText, (pageWidth - logoWidth) / 2, 20);
    }
    
    // Header section
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    const headerText = "RENTAL AGREEMENT";
    const headerWidth = doc.getStringUnitWidth(headerText) * 16 / doc.internal.scaleFactor;
    doc.text(headerText, (pageWidth - headerWidth) / 2, 35);
    
    // Contract details line
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(`Contract #${contractData.contractId} • ${contractData.currentDate} • ${contractData.city}`, (pageWidth - 80) / 2, 42);
    
    // Horizontal divider
    doc.setDrawColor(lightColor[0], lightColor[1], lightColor[2]);
    doc.setLineWidth(0.5);
    doc.line(marginX, 48, pageWidth - marginX, 48);
    
    // Helper function for section headers
    const addSectionHeader = (text: string, x: number, y: number) => {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text(text.toUpperCase(), x, y);
        
        // Add underline
        const textWidth = doc.getStringUnitWidth(text) * 12 / doc.internal.scaleFactor;
        doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.setLineWidth(0.3);
        doc.line(x, y + 1, x + textWidth, y + 1);
        
        return y + 8;
    };
    
    // Helper function for field text
    const addFieldText = (label: string, value: string, x: number, y: number, maxWidth: number = columnWidth - 5) => {
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(label + ":", x, y);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        const lines = doc.splitTextToSize(value, maxWidth);
        doc.text(lines, x, y + 4);
        
        return y + 4 + (lines.length * 4);
    };
    
    let startY = 58;
    
    // LEFT COLUMN - OWNER INFORMATION
    let currentY = addSectionHeader("Owner Information", leftColumnX, startY);
    currentY = addFieldText("Name", contractData.ownerName, leftColumnX, currentY) + 2;
    currentY = addFieldText("Email", contractData.ownerEmail, leftColumnX, currentY) + 2;
    currentY = addFieldText("Phone", contractData.ownerPhone, leftColumnX, currentY) + 2;
    currentY = addFieldText("Address", `${contractData.ownerAddress}, ${contractData.ownerCity}`, leftColumnX, currentY) + 8;
    
    // CENTER COLUMN - PRODUCT & PRICING
    let centerY = addSectionHeader("Rental Product", centerColumnX, startY);
    centerY = addFieldText("Item", contractData.object, centerColumnX, centerY) + 2;
    centerY = addFieldText("Brand", contractData.brand, centerColumnX, centerY) + 2;
    centerY = addFieldText("Model", contractData.model, centerColumnX, centerY) + 2;
    centerY = addFieldText("Quantity", contractData.quantity.toString(), centerColumnX, centerY) + 2;
    centerY = addFieldText("Description", contractData.description, centerColumnX, centerY) + 4;
    
    centerY = addSectionHeader("Pricing Details", centerColumnX, centerY + 5);
    centerY = addFieldText("Daily Rate", formatCurrency(contractData.pricePerDay), centerColumnX, centerY) + 2;
    centerY = addFieldText("Weekly Rate", formatCurrency(contractData.pricePerWeek), centerColumnX, centerY) + 2;
    centerY = addFieldText("Security Deposit", formatCurrency(contractData.deposit), centerColumnX, centerY) + 4;
    
    // Highlight total amount
    doc.setFillColor(lightColor[0], lightColor[1], lightColor[2]);
    doc.rect(centerColumnX - 2, centerY - 2, columnWidth + 4, 12, 'F');
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text("TOTAL AMOUNT", centerColumnX, centerY + 3);
    doc.setFontSize(14);
    doc.text(formatCurrency(contractData.totalAmount), centerColumnX, centerY + 8);
    centerY += 16;
    
    // RIGHT COLUMN - RENTER INFORMATION
    let rightY = addSectionHeader("Renter Information", rightColumnX, startY);
    rightY = addFieldText("Name", contractData.renterName, rightColumnX, rightY) + 2;
    rightY = addFieldText("Email", contractData.renterEmail, rightColumnX, rightY) + 2;
    rightY = addFieldText("Phone", contractData.renterPhone, rightColumnX, rightY) + 2;
    rightY = addFieldText("Address", `${contractData.renterAddress}, ${contractData.renterCity}`, rightColumnX, rightY) + 8;
    
    // RENTAL TERMS SECTION (spans all columns)
    const termsY = Math.max(currentY, centerY, rightY) + 10;
    
    // Background for terms section
    doc.setFillColor(lightColor[0], lightColor[1], lightColor[2]);
    doc.rect(marginX, termsY - 5, pageWidth - 2 * marginX, 35, 'F');
    
    let termsSectionY = addSectionHeader("Rental Terms", marginX + 5, termsY);
    
    // Two-column layout for rental terms
    const leftTermsX = marginX + 5;
    const rightTermsX = pageWidth / 2 + 10;
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    
    termsSectionY = addFieldText("Rental Period", contractData.usageDate, leftTermsX, termsSectionY) + 2;
    addFieldText("Return Date", contractData.retrievalDates, rightTermsX, termsSectionY - 6);
    
    termsSectionY = addFieldText("Item Condition (Start)", contractData.stateBefore, leftTermsX, termsSectionY) + 2;
    addFieldText("Item Condition (Return)", contractData.stateAfter || "To be assessed", rightTermsX, termsSectionY - 6);
    
    if (contractData.precautions) {
        termsSectionY = addFieldText("Special Instructions", contractData.precautions, leftTermsX, termsSectionY, pageWidth - 2 * marginX - 10) + 4;
    }
    
    // SIGNATURE SECTION
    const signatureY = termsY + 45;
    
    // Signature boxes with equal alignment
    const signatureBoxHeight = 25;
    const signatureBoxY = signatureY + 15;
    
    // Owner signature (left)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Owner Signature", leftColumnX, signatureY);
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setLineWidth(0.3);
    doc.rect(leftColumnX, signatureBoxY, columnWidth, signatureBoxHeight);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("Date: _______________", leftColumnX, signatureBoxY + signatureBoxHeight + 8);
    
    // Renter signature (right)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Renter Signature", rightColumnX, signatureY);
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setLineWidth(0.3);
    doc.rect(rightColumnX, signatureBoxY, columnWidth, signatureBoxHeight);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("Date: _______________", rightColumnX, signatureBoxY + signatureBoxHeight + 8);
    
    // Footer
    const footerY = pageHeight - 15;
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    const footerText = "This agreement constitutes the entire rental contract. Both parties acknowledge receipt of a copy.";
    const footerWidth = doc.getStringUnitWidth(footerText) * 7 / doc.internal.scaleFactor;
    doc.text(footerText, (pageWidth - footerWidth) / 2, footerY);
    
    // Save the PDF
    doc.save(`rental_contract_${contractData.contractId}.pdf`);
};