H5P.MarkTheWordsModified = H5P.MarkTheWordsModified || {};

/**
 * Mark the words XapiGenerator
 */
H5P.MarkTheWordsModified.XapiGenerator = (function ($) {

  /**
   * Xapi statements Generator
   * @param {H5P.MarkTheWordsModified} markTheWordsModified
   * @constructor
   */
  function XapiGenerator(markTheWordsModified) {

    /**
     * Generate answered event
     * @return {H5P.XAPIEvent}
     */
    this.generateAnsweredEvent = function () {
      var xAPIEvent = markTheWordsModified.createXAPIEventTemplate('answered');

      // Extend definition
      var objectDefinition = createDefinition(markTheWordsModified);
      $.extend(true, xAPIEvent.getVerifiedStatementValue(['object', 'definition']), objectDefinition);

      // Set score
      xAPIEvent.setScoredResult(markTheWordsModified.getScore(),
        markTheWordsModified.getMaxScore(),
        markTheWordsModified,
        true,
        markTheWordsModified.getScore() === markTheWordsModified.getMaxScore()
      );

      // Extend user result
      var userResult = {
        response: getUserSelections(markTheWordsModified)
      };

      $.extend(xAPIEvent.getVerifiedStatementValue(['result']), userResult);

      return xAPIEvent;
    };
  }

  /**
   * Create object definition for question
   *
   * @param {H5P.MarkTheWordsModified} markTheWordsModified
   * @return {Object} Object definition
   */
  function createDefinition(markTheWordsModified) {
    var definition = {};
    definition.description = {
      'en-US': replaceLineBreaks(markTheWordsModified.params.taskDescription)
    };
    definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
    definition.interactionType = 'choice';
    definition.correctResponsesPattern = [getCorrectResponsesPattern(markTheWordsModified)];
    definition.choices = getChoices(markTheWordsModified);
    definition.extensions = {
      'https://h5p.org/x-api/line-breaks': markTheWordsModified.getIndexesOfLineBreaks()
    };
    return definition;
  }

  /**
   * Replace line breaks
   *
   * @param {string} description
   * @return {string}
   */
  function replaceLineBreaks(description) {
    var sanitized = $('<div>' + description + '</div>').text();
    return sanitized.replace(/(\n)+/g, '<br/>');
  }

  /**
   * Get all choices that it is possible to choose between
   *
   * @param {H5P.MarkTheWordsModified} markTheWordsModified
   * @return {Array}
   */
  function getChoices(markTheWordsModified) {
    return markTheWordsModified.selectableWords.map(function (word, index) {
      var text = word.getText();
      if (text.charAt(0) === '*' && text.charAt(text.length - 1) === '*') {
        text = text.substr(1, text.length - 2);
      }

      return {
        id: index.toString(),
        description: {
          'en-US': $('<div>' + text + '</div>').text()
        }
      };
    });
  }

  /**
   * Get selected words as a user response pattern
   *
   * @param {H5P.MarkTheWordsModified} markTheWordsModified
   * @return {string}
   */
  function getUserSelections(markTheWordsModified) {
    return markTheWordsModified.selectableWords
      .reduce(function (prev, word, index) {
        if (word.isSelected()) {
          prev.push(index);
        }
        return prev;
      }, []).join('[,]');
  }

  /**
   * Get correct response pattern from correct words
   *
   * @param {H5P.MarkTheWordsModified} markTheWordsModified
   * @return {string}
   */
  function getCorrectResponsesPattern(markTheWordsModified) {
    return markTheWordsModified.selectableWords
      .reduce(function (prev, word, index) {
        if (word.isAnswer()) {
          prev.push(index);
        }
        return prev;
      }, []).join('[,]');
  }

  return XapiGenerator;
})(H5P.jQuery);
