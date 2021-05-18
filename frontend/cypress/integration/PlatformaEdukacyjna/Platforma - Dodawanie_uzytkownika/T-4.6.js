/// <reference types="cypress" />
import "cypress-localstorage-commands"

import dane from "../Dane/dane.js"

describe("Test ID: T-4-6", () => {
  it(dane.platforma_dodawanie_uzytkownika.t4_6.testName, () => {
    cy.visit(dane.address)
    //click "Zaloguj się"
    cy.contains("Logowanie").click()
    //fill form
    cy.get('[type="text"]').type(dane.logowanie.t2_1.login)
    cy.get('[type="password"]').type(dane.logowanie.t2_1.password)
    cy.get("form > .neumorphizm").click()

    //check sessionToken
    cy.wait(700)
    cy.url().should("include", "", () => {
      expect(localStorage.getItem("sessionToken")).to.exist()
    })

    cy.get('.select-module--toggleBoxBtn--1DJgJ').click()
    cy.contains('Nowa organizacja').click()
    cy.get('.box-module--switch--2qfSI > .gatsby-image-wrapper > picture > img').click()
    cy.get('.box-module--tabsSwitches--3baZf > :nth-child(2)').click()
    cy.get(':nth-child(1) > .platformChooser-module--adder--3Q9wM').type(dane.platforma_dodawanie_uzytkownika.t4_6.imie)
    cy.get(':nth-child(2) > .platformChooser-module--adder--3Q9wM').type(dane.platforma_dodawanie_uzytkownika.t4_6.nazwisko)
    cy.get(':nth-child(3) > .platformChooser-module--adder--3Q9wM').type(dane.platforma_dodawanie_uzytkownika.t4_6.email)
    cy.get(':nth-child(4) > .platformChooser-module--adder--3Q9wM').select("Student")
    cy.get(':nth-child(5) > .neumorphizm').click()




    cy.contains(dane.platforma_dodawanie_uzytkownika.t4_6.error)

  })
})
