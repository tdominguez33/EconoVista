import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import static com.kms.katalon.core.testobject.ObjectRepository.findWindowsObject
import com.kms.katalon.core.checkpoint.Checkpoint as Checkpoint
import com.kms.katalon.core.cucumber.keyword.CucumberBuiltinKeywords as CucumberKW
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as Mobile
import com.kms.katalon.core.model.FailureHandling as FailureHandling
import com.kms.katalon.core.testcase.TestCase as TestCase
import com.kms.katalon.core.testdata.TestData as TestData
import com.kms.katalon.core.testng.keyword.TestNGBuiltinKeywords as TestNGKW
import com.kms.katalon.core.testobject.TestObject as TestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.windows.keyword.WindowsBuiltinKeywords as Windows
import internal.GlobalVariable as GlobalVariable
import org.openqa.selenium.Keys as Keys

import com.kms.katalon.core.webui.driver.DriverFactory
import org.openqa.selenium.By
import org.openqa.selenium.WebDriver

WebUI.openBrowser('http://localhost:4200/')
WebDriver driver = DriverFactory.getWebDriver()

WebUI.click(findTestObject('Object Repository/Page_Econovista/div_Dlar Oficial Minorista 1095.52'))

WebUI.click(findTestObject('Object Repository/Page_Econovista/span_Ajuste CER'))

driver.findElement(By.xpath("//span[contains(text(), 'Limpiar')]")).click()

WebUI.click(findTestObject('Object Repository/Page_Econovista/img_TIPO DE CAMBIO DE REFERENCIA MINORISTA_icon'))

WebUI.click(findTestObject('Object Repository/Page_Econovista/div_Dolar Oficial Mayorista 1066.04'))

WebUI.click(findTestObject('Object Repository/Page_Econovista/span_Ajuste CER'))

driver.findElement(By.xpath("//span[contains(text(), 'Limpiar')]")).click()

WebUI.click(findTestObject('Object Repository/Page_Econovista/img_TIPO DE CAMBIO DE REFERENCIA MINORISTA_icon'))

WebUI.closeBrowser()

