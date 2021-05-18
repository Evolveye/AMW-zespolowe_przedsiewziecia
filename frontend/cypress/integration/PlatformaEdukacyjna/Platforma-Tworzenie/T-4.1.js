/// <reference types="cypress" />
import "cypress-localstorage-commands"

import dane from "../Dane/dane.js"

describe("Test ID: T-4-1", () => {
  it(dane.platforma_tworzenie.t4_1.testName, () => {
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
    cy.get('.platformChooser-module--isCenteredButton--Mfv6r').click()
    cy.get('form > input').type(dane.platforma_tworzenie.t4_1.nazwa)
    cy.get('form > .neumorphizm').click()
    cy.contains(dane.platforma_tworzenie.t4_1.nazwa)

  })
})
