/// <reference types="cypress" />
import "cypress-localstorage-commands"

import dane from "../Dane/dane.js"

describe("Test ID: T-3-1", () => {
  it(dane.wylogowanie.t3_1.testName, () => {
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

    cy.get('.userField-module--avatar--2h116 > picture > img').click()
    cy.contains('Wyloguj').click()
    cy.wait(700)
    cy.contains('Logowanie')
  })
})
