/// <reference types="cypress" />
import "cypress-localstorage-commands"

import dane from "../Dane/dane.js"

describe('Test ID: T-2-5', () => {
    it(dane.logowanie.t2_5.testName, () => {
      cy.visit(dane.address)
      //click "Zaloguj się"
      cy.contains('Logowanie').click()
      //fill form
      cy.get('[type="text"]').type(dane.logowanie.t2_5.login)
      cy.get('[type="password"]').invoke('val', '')
      cy.get('form > .neumorphizm').click()


      cy.wait(700)
      cy.contains(dane.logowanie.t2_5.error)
    })
  })