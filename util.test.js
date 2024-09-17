/* global describe it expect beforeEach beforeAll */
const { escapeComment, stripHTML, writeHeader, appendRow, getWordCount, getDateDiff, toDateTime, convertToPacificTime } = require('./util')
const fs = require('fs')
const path = require('path')
const { DateTime } = require('luxon')

describe('Utils Functions', () => {
  describe('convertToPacificTime', () => {
    it('should convert a valid UTC DateTime object with only hours to Pacific Time', () => {
      const utcDateTime = DateTime.fromISO('2024-09-16T12:00:00Z', { zone: 'utc' })

      const pacificDateTime = convertToPacificTime(utcDateTime)

      expect(pacificDateTime).toBeInstanceOf(DateTime)
      expect(pacificDateTime.toISO()).toBe('2024-09-16T05:00:00.000-07:00') // Pacific Time offset (-07:00 for PDT)
    })

    it('should handle UTC midnight correctly', () => {
      const utcDateTime = DateTime.fromISO('2024-09-16T00:00:00Z', { zone: 'utc' })
      const pacificDateTime = convertToPacificTime(utcDateTime)
      // Assert that the conversion is correct
      expect(pacificDateTime).toBeInstanceOf(DateTime)
      expect(pacificDateTime.toISO()).toBe('2024-09-15T17:00:00.000-07:00') // Pacific Time offset (-07:00 for PDT)
    })

    it('should handle UTC time with -08:00 offset correctly', () => {
      const utcDateTime = DateTime.fromISO('2024-01-16T12:00:00Z', { zone: 'utc' })
      const pacificDateTime = convertToPacificTime(utcDateTime)

      expect(pacificDateTime).toBeInstanceOf(DateTime)
      // so noon UTC should be 4 AM PST the same day
      expect(pacificDateTime.toISO()).toBe('2024-01-16T04:00:00.000-08:00')
    })

    it('should return null if the input is null', () => {
      const result = convertToPacificTime(null)
      expect(result).toBeNull()
    })

    it('should return null if the input is an invalid DateTime object', () => {
      const invalidDateTime = DateTime.invalid('Invalid DateTime')
      const result = convertToPacificTime(invalidDateTime)
      expect(result).toBeNull()
    })
  })

  describe('toDateTime', () => {
    it('should convert a valid ISO date string to a luxon DateTime object', () => {
      const isoString = '2024-09-16T12:34:56.000Z'
      const result = toDateTime(isoString)
      expect(result.toISO()).toBe(isoString)
    })

    it('should return null if the input is null', () => {
      const result = toDateTime(null)
      expect(result).toBeNull()
    })

    it('should return null if the input is undefined', () => {
      const result = toDateTime(undefined)
      expect(result).toBeNull()
    })

    it('should handle an empty string by returning null', () => {
      const emptyString = ''
      const result = toDateTime(emptyString)
      expect(result).toBeNull()
    })

    it('should return null if the input is an invalid ISO string', () => {
      const invalidIsoString = 'invalid-date'
      const result = toDateTime(invalidIsoString)
      expect(result).toBeNull()
    })
  })

  describe('getDateDiff', () => {
    it('should return 0 if the same date and different times', () => {
      const referenceTimestamp = '2024-06-22T00:23:54Z'
      const relativeTimestamp = '2024-06-22T12:23:54Z' // Same date and time

      expect(getDateDiff(referenceTimestamp, relativeTimestamp)).toBe(0)
    })

    it('should return 1 if the relativeDate is the next day any time', () => {
      const referenceTimestamp = '2024-06-22T00:23:54Z'
      const relativeTimestamp = '2024-06-23T12:23:54Z' // Same date and time

      expect(getDateDiff(referenceTimestamp, relativeTimestamp)).toBe(1)
    })

    it('should return 10 if the relativeDate is 10 days later', () => {
      const referenceTimestamp = '2024-06-10T00:23:54Z'
      const relativeTimestamp = '2024-06-20T12:23:54Z' // Same date and time

      expect(getDateDiff(referenceTimestamp, relativeTimestamp)).toBe(10)
    })
  })

  describe('escapeComment', () => {
    it('should escape quotes in comments', () => {
      const input = 'This is a "comment"'
      const expected = '"This is a \'comment\'"'
      expect(escapeComment(input)).toEqual(expected)
    })

    it('should return empty string if input is empty', () => {
      const input = ''
      const expected = ''
      expect(escapeComment(input)).toEqual(expected)
    })
  })

  describe('stripHTML', () => {
    it('should remove HTML tags and &nbsp;', () => {
      const input = '<div>Hello &nbsp; World</div>'
      const expected = 'Hello   World'
      expect(stripHTML(input)).toEqual(expected)
    })

    it('should return empty string if input is empty', () => {
      const input = ''
      const expected = ''
      expect(stripHTML(input)).toEqual(expected)
    })
  })

  describe('writeHeader', () => {
    const testFilePath = path.join(__dirname, 'test.csv')

    beforeEach(() => {
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath)
      }
    })

    afterAll(() => {
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath)
      }
    })

    it('should write headers to a file', () => {
      const headers = ['Name', 'Age']
      writeHeader(testFilePath, headers)
      const fileContent = fs.readFileSync(testFilePath, 'utf8')
      expect(fileContent).toBe('Name,Age\r\n')
    })
  })

  describe('appendRow', () => {
    const testFilePath = path.join(__dirname, 'test.csv')

    beforeEach(() => {
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath)
      }
    })

    afterAll(() => {
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath)
      }
    })

    it('should append a row to a file', () => {
      const row = ['John', '30']
      appendRow(testFilePath, row)
      const fileContent = fs.readFileSync(testFilePath, 'utf8')
      expect(fileContent).toBe('John,30\r\n')
    })
  })

  describe('getWordCount', () => {
    it('should count words correctly after stripping HTML and escaping comments', () => {
      const input = '<p>This is a "test" string with &nbsp; some HTML</p>'
      const expected = 8 // "This is a test string with some HTML" -> 8 words
      expect(getWordCount(input)).toBe(expected)
    })

    it('should return 0 for empty input', () => {
      const input = ''
      const expected = 0
      expect(getWordCount(input)).toBe(expected)
    })

    it('should return 2 for a dashed-string', () => {
      const input = 'dashed-string'
      const expected = 2
      expect(getWordCount(input)).toBe(expected)
    })
  })
})
