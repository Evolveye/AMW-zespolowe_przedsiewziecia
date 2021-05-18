/// <reference types="cypress" />
import "cypress-localstorage-commands"

import dane from "../Dane/dane.js"

describe('Test ID: T-2-2', () => {
    it(dane.logowanie.t2_2.testName, () => {
      cy.visit(dane.address)
      //click "Zaloguj się"
      cy.contains('Logowanie').click()
      //fill form
      cy.get('[type="text"]').type(dane.logowanie.t2_2.login)
      cy.get('[type="password"]').type(dane.logowanie.t2_2.password)
      cy.get('form > .neumorphizm').click()


      cy.wait(700)
      cy.contains(dane.logowanie.t2_2.error)
    })
  })