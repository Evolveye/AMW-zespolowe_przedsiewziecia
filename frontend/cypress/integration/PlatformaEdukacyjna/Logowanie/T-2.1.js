/// <reference types="cypress" />
import "cypress-localstorage-commands"

import dane from "../Dane/dane.js"

describe('Test ID: T-2-1', () => {
    it(dane.logowanie.t2_1.testName, () => {
      cy.visit(dane.address)
      //click "Zaloguj się"
      cy.contains('Logowanie').click()
      //fill form
      cy.get('[type="text"]').type(dane.logowanie.t2_1.login)
      cy.get('[type="password"]').type(dane.logowanie.t2_1.password)
      cy.get('form > .neumorphizm').click()


      //check sessionToken
      cy.wait(700)
      cy.url().should("include", "", ()=> {
        expect(localStorage.getItem("sessionToken")).to.exist()
    })
    })
  })