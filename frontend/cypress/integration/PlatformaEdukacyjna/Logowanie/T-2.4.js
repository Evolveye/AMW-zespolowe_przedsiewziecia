/// <reference types="cypress" />
import "cypress-localstorage-commands"

import dane from "../Dane/dane.js"

describe('Test ID: T-2-4', () => {
    it(dane.logowanie.t2_4.testName, () => {
      cy.visit(dane.address)
      //click "Zaloguj się"
      cy.contains('Logowanie').click()
      //fill form
      cy.get('[type="text"]').invoke('val', '')
      cy.get('[type="password"]').type(dane.logowanie.t2_4.password)
      cy.get('form > .neumorphizm').click()


      cy.wait(700)
      cy.contains(dane.logowanie.t2_4.error)
    })
  })