/// <reference types="cypress" />
import "cypress-localstorage-commands"

import dane from "../Dane/dane.js"

describe('Test ID: T-1-3', () => {
    it(dane.rejestracja.t1_3.testName, () => {
      cy.visit(dane.address)
      //click "Zaloguj się"
      cy.contains('Rejestracja').click()
      //fill form
      cy.get('[name="name"]').type(dane.rejestracja.t1_3.imie)
      cy.get('[name="surname"]').type(dane.rejestracja.t1_3.nazwisko)
      cy.get('[name="email"]').type(dane.rejestracja.t1_3.email)
      cy.get('[name="password1"]').type(dane.rejestracja.t1_3.haslo1)
      cy.get('[name="password2"]').type(dane.rejestracja.t1_3.haslo2)
  
      cy.get('form > .neumorphizm').click()

      cy.wait(700)
      cy.contains(dane.rejestracja.t1_3.error)
    })
  })