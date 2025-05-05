package utils

import (
	"bytes"
	"fmt"
	"html/template"

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

	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, "Rental Contract")

	pdf.Ln(10)

	pdf.SetFont("Arial", "", 12)
	tmpl := `
    Object: {{.Object}}
    Brand: {{.Brand}}
    Model: {{.Model}}
    Quantity: {{.Quantity}}
    Description: {{.Description}}
    Precautions: {{.Precautions}}
    Price for 1-day rent: {{.PricePerDay}}
    Price for 1-week rent: {{.PricePerWeek}}
    Caution/Deposit: {{.CautionDeposit}}
    
    Renter Information:
    Name: {{.RenterFirstName}} {{.RenterLastName}}
    Address: {{.RenterAddress}}, {{.RenterCity}}
    Birth Date: {{.RenterBirthDate}}
    Phone: {{.RenterPhone}}
    Email: {{.RenterEmail}}
    
    Rental Details:
    Rental Days: {{.RentalDays}}
    Total Amount: {{.TotalAmount}}
    State Before: {{.StateBefore}}
    State After: {{.StateAfter}}
    Usage Date: {{.UsageDate}}
    Retrieval Date: {{.RetrievalDate}}
    `

	t, err := template.New("contract").Parse(tmpl)
	if err != nil {
		return "", err
	}

	var doc bytes.Buffer
	if err := t.Execute(&doc, contractData); err != nil {
		return "", err
	}

	pdf.MultiCell(0, 10, doc.String(), "", "", false)

	outputFile := fmt.Sprintf("contract_%s.pdf", contractData.RenterLastName)
	err = pdf.OutputFileAndClose(outputFile)
	if err != nil {
		return "", err
	}

	return outputFile, nil
}
