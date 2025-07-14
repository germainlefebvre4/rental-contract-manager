package utils

import (
	"fmt"
	"math"

	"github.com/jung-kurt/gofpdf"
)

type ContractData struct {
	Object          string
	Brand           string
	Model           string
	Quantity        int
	Description     string
	Precautions     string
	PricePerDay     float64
	PricePerWeek    float64
	CautionDeposit  float64
	RenterFirstName string
	RenterLastName  string
	RenterAddress   string
	RenterCity      string
	RenterBirthDate string
	RenterPhone     string
	RenterEmail     string
	OwnerFirstName  string
	OwnerLastName   string
	OwnerAddress    string
	OwnerCity       string
	OwnerPhone      string
	OwnerEmail      string
	RentalDays      int
	TotalAmount     float64
	StateBefore     string
	StateAfter      string
	UsageDate       string
	RetrievalDate   string
}

func GeneratePDF(contractData ContractData) (string, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	// Define dimensions and colors
	pageWidth, pageHeight := pdf.GetPageSize()
	marginX := 15.0
	columnWidth := (pageWidth - 4*marginX) / 3
	leftColumnX := marginX
	centerColumnX := marginX + columnWidth + marginX
	rightColumnX := marginX + 2*(columnWidth+marginX)

	// Color definitions (RGB values 0-255)
	primaryColor := []int{64, 64, 64}      // Dark gray
	secondaryColor := []int{128, 128, 128} // Medium gray
	lightColor := []int{245, 245, 245}     // Light gray
	accentColor := []int{41, 128, 185}     // Blue accent

	// Helper function to set RGB color
	setTextColor := func(color []int) {
		pdf.SetTextColor(color[0], color[1], color[2])
	}
	setDrawColor := func(color []int) {
		pdf.SetDrawColor(color[0], color[1], color[2])
	}
	setFillColor := func(color []int) {
		pdf.SetFillColor(color[0], color[1], color[2])
	}

	// Logo/Company name at top
	pdf.SetFont("Arial", "B", 24)
	setTextColor(accentColor)
	logoText := "Rent4Goods"
	logoWidth := pdf.GetStringWidth(logoText)
	pdf.Text((pageWidth-logoWidth)/2, 20, logoText)

	// Header
	pdf.SetFont("Arial", "B", 16)
	setTextColor(primaryColor)
	headerText := "RENTAL AGREEMENT"
	headerWidth := pdf.GetStringWidth(headerText)
	pdf.Text((pageWidth-headerWidth)/2, 35, headerText)

	// Contract details
	pdf.SetFont("Arial", "", 10)
	setTextColor(secondaryColor)
	contractDetails := fmt.Sprintf("Contract #%s • %s",
		fmt.Sprintf("%d", int(contractData.TotalAmount)), contractData.UsageDate)
	detailsWidth := pdf.GetStringWidth(contractDetails)
	pdf.Text((pageWidth-detailsWidth)/2, 42, contractDetails)

	// Horizontal divider
	setDrawColor(lightColor)
	pdf.SetLineWidth(0.5)
	pdf.Line(marginX, 48, pageWidth-marginX, 48)

	// Helper function for section headers
	addSectionHeader := func(text string, x, y float64) float64 {
		pdf.SetFont("Arial", "B", 12)
		setTextColor(accentColor)
		pdf.Text(x, y, text)

		// Add underline
		textWidth := pdf.GetStringWidth(text)
		setDrawColor(accentColor)
		pdf.SetLineWidth(0.3)
		pdf.Line(x, y+1, x+textWidth, y+1)

		return y + 8
	}

	// Helper function for field text
	addFieldText := func(label, value string, x, y float64) float64 {
		pdf.SetFont("Arial", "B", 9)
		setTextColor(primaryColor)
		pdf.Text(x, y, label+":")

		pdf.SetFont("Arial", "", 9)
		setTextColor(secondaryColor)

		// Handle text wrapping
		lines := pdf.SplitLines([]byte(value), columnWidth-5)
		currentY := y + 4
		for _, line := range lines {
			pdf.Text(x, currentY, string(line))
			currentY += 4
		}

		return currentY
	}

	startY := 58.0

	// LEFT COLUMN - OWNER INFORMATION
	currentY := addSectionHeader("OWNER INFORMATION", leftColumnX, startY)
	currentY = addFieldText("Name", contractData.OwnerFirstName+" "+contractData.OwnerLastName, leftColumnX, currentY) + 2
	currentY = addFieldText("Email", contractData.OwnerEmail, leftColumnX, currentY) + 2
	currentY = addFieldText("Phone", contractData.OwnerPhone, leftColumnX, currentY) + 2
	currentY = addFieldText("Address", contractData.OwnerAddress+", "+contractData.OwnerCity, leftColumnX, currentY) + 8

	// CENTER COLUMN - PRODUCT & PRICING
	centerY := addSectionHeader("RENTAL PRODUCT", centerColumnX, startY)
	centerY = addFieldText("Item", contractData.Object, centerColumnX, centerY) + 2
	centerY = addFieldText("Brand", contractData.Brand, centerColumnX, centerY) + 2
	centerY = addFieldText("Model", contractData.Model, centerColumnX, centerY) + 2
	centerY = addFieldText("Quantity", fmt.Sprintf("%d", contractData.Quantity), centerColumnX, centerY) + 2
	centerY = addFieldText("Description", contractData.Description, centerColumnX, centerY) + 4

	centerY = addSectionHeader("PRICING DETAILS", centerColumnX, centerY+5)
	centerY = addFieldText("Daily Rate", fmt.Sprintf("$%.2f", contractData.PricePerDay), centerColumnX, centerY) + 2
	centerY = addFieldText("Weekly Rate", fmt.Sprintf("$%.2f", contractData.PricePerWeek), centerColumnX, centerY) + 2
	centerY = addFieldText("Security Deposit", fmt.Sprintf("$%.2f", contractData.CautionDeposit), centerColumnX, centerY) + 4

	// Highlight total amount
	setFillColor(lightColor)
	pdf.Rect(centerColumnX-2, centerY-2, columnWidth+4, 12, "F")
	pdf.SetFont("Arial", "B", 11)
	setTextColor(accentColor)
	pdf.Text(centerColumnX, centerY+3, "TOTAL AMOUNT")
	pdf.SetFont("Arial", "B", 14)
	pdf.Text(centerColumnX, centerY+8, fmt.Sprintf("$%.2f", contractData.TotalAmount))
	centerY += 16

	// RIGHT COLUMN - RENTER INFORMATION
	rightY := addSectionHeader("RENTER INFORMATION", rightColumnX, startY)
	rightY = addFieldText("Name", contractData.RenterFirstName+" "+contractData.RenterLastName, rightColumnX, rightY) + 2
	rightY = addFieldText("Email", contractData.RenterEmail, rightColumnX, rightY) + 2
	rightY = addFieldText("Phone", contractData.RenterPhone, rightColumnX, rightY) + 2
	rightY = addFieldText("Address", contractData.RenterAddress+", "+contractData.RenterCity, rightColumnX, rightY) + 8

	// RENTAL TERMS SECTION (spans all columns)
	termsY := math.Max(math.Max(currentY, centerY), rightY) + 10

	// Background for terms section
	setFillColor(lightColor)
	pdf.Rect(marginX, termsY-5, pageWidth-2*marginX, 35, "F")

	termsSectionY := addSectionHeader("RENTAL TERMS", marginX+5, termsY)

	// Two-column layout for rental terms
	leftTermsX := marginX + 5
	rightTermsX := pageWidth/2 + 10

	pdf.SetFont("Arial", "", 9)
	setTextColor(primaryColor)

	termsSectionY = addFieldText("Rental Period", contractData.UsageDate, leftTermsX, termsSectionY) + 2
	addFieldText("Return Date", contractData.RetrievalDate, rightTermsX, termsSectionY-6)

	termsSectionY = addFieldText("Item Condition (Start)", contractData.StateBefore, leftTermsX, termsSectionY) + 2
	stateAfter := contractData.StateAfter
	if stateAfter == "" {
		stateAfter = "To be assessed"
	}
	addFieldText("Item Condition (Return)", stateAfter, rightTermsX, termsSectionY-6)

	if contractData.Precautions != "" {
		termsSectionY = addFieldText("Special Instructions", contractData.Precautions, leftTermsX, termsSectionY) + 4
	}

	// SIGNATURE SECTION
	signatureY := termsY + 45
	signatureBoxHeight := 25.0
	signatureBoxY := signatureY + 15

	// Owner signature (left)
	pdf.SetFont("Arial", "B", 10)
	setTextColor(primaryColor)
	pdf.Text(leftColumnX, signatureY, "Owner Signature")
	setDrawColor(secondaryColor)
	pdf.SetLineWidth(0.3)
	pdf.Rect(leftColumnX, signatureBoxY, columnWidth, signatureBoxHeight, "D")
	pdf.SetFont("Arial", "", 8)
	setTextColor(secondaryColor)
	pdf.Text(leftColumnX, signatureBoxY+signatureBoxHeight+8, "Date: _______________")

	// Renter signature (right)
	pdf.SetFont("Arial", "B", 10)
	setTextColor(primaryColor)
	pdf.Text(rightColumnX, signatureY, "Renter Signature")
	setDrawColor(secondaryColor)
	pdf.SetLineWidth(0.3)
	pdf.Rect(rightColumnX, signatureBoxY, columnWidth, signatureBoxHeight, "D")
	pdf.SetFont("Arial", "", 8)
	setTextColor(secondaryColor)
	pdf.Text(rightColumnX, signatureBoxY+signatureBoxHeight+8, "Date: _______________")

	// Footer
	footerY := pageHeight - 15
	pdf.SetFont("Arial", "I", 7)
	setTextColor(secondaryColor)
	footerText := "This agreement constitutes the entire rental contract. Both parties acknowledge receipt of a copy."
	footerWidth := pdf.GetStringWidth(footerText)
	pdf.Text((pageWidth-footerWidth)/2, footerY, footerText)

	outputFile := fmt.Sprintf("contract_%s.pdf", contractData.RenterLastName)
	err := pdf.OutputFileAndClose(outputFile)
	if err != nil {
		return "", err
	}

	return outputFile, nil
}
