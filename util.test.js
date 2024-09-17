const { escapeComment, stripHTML, writeHeader, appendRow, getWordCount, getDateDiff } = require('./util')
const fs = require('fs')
const path = require('path')

describe('Utils Functions', () => {

	describe('getDateDiff', () => {
		it('should return 0 if the same date and time', () => {
		  const referenceTimestamp = '2024-06-22T00:23:54Z'
		  const relativeTimestamp = '2024-06-22T00:23:54Z' // Same date and time
	  
		  // Call the function and check the result
		  expect(getDateDiff(referenceTimestamp, relativeTimestamp)).toBe(0)
		}),

		it('should return 1 if the relativeDate is the next day any time', () => {
			const referenceTimestamp = '2024-06-22T00:23:54Z'
			const relativeTimestamp = '2024-06-23T12:23:54Z' // Same date and time
		
			// Call the function and check the result
			expect(getDateDiff(referenceTimestamp, relativeTimestamp)).toBe(1)
		})

		it('should return 10 if the relativeDate is 10 days later', () => {
			const referenceTimestamp = '2024-06-10T00:23:54Z'
			const relativeTimestamp = '2024-06-20T12:23:54Z' // Same date and time
		
			// Call the function and check the result
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

        it('should return 2 for a dashed-string', () =>{
            const input = 'dashed-string'
            const expected = 2
            expect(getWordCount(input)).toBe(expected)
        })
	})

})