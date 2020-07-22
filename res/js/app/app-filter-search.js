// TODO: maybe implement recorded in ... filter (until version 1.2)

function togglePersonFilter(person){
    app.filterMap.persons[person] = !app.filterMap.persons[person];
    setFiltered();
}

function toggleYearFilter(year){
    app.filterMap.years[year] = !app.filterMap.years[year];
    setFiltered();
}

function isFilteredPerson(person){
    return app.filterMap.persons[person];
}

function isFilteredYear(year){
    return app.filterMap.years[year];
}

function hasMatchingVideo(filter, type){
    let list = type === 'persons' ? app.filterMap.persons : app.filterMap.years;
    if(list[filter]){
        return true;
    }
    list[filter] = true;
    for(let i = 0; i < app.videos.length; i++){
        if(isFilterMatch(app.videos[i].title)){
            list[filter] = false;
            return true;
        }
    }
    list[filter] = false;
    return false;
}

function isMatch(designator){
    return isSearchMatch(designator) && isFilterMatch(designator);
}

function isSearchMatch(designator){
    if(app.search.trim() === ''){
        return true;
    }
    let title = app.videoMap[designator].decryptedTitle;
    let description = app.videoMap[designator].decryptedDescription;
    let textToSearchIn = `${title} ${description}`.toLowerCase();
    let words = app.search.replace(/\s\s+/g, ' ').split(' ');
    for(let i = 0; i < words.length; i++){
        let word = words[i].toLowerCase();
        if(textToSearchIn.indexOf(word) >= 0){
            return true;
        }
    }
    return false;
}

function isFilterMatch(designator){
    if(!app.filters){
        return true;
    }
    return isPersonFilterMatch(designator) && isYearFilterMatch(designator);
}

function isPersonFilterMatch(designator){
    if(!hasPersonFilter()){
        return true;
    }
    if(app.videoMap[designator].video.persons.length === 0){
        return false;
    }
    let attrList = app.videoMap[designator].persons;
    return isFilterTypeMatch(app.persons, app.filterMap.persons, attrList);
}

function isYearFilterMatch(designator){
    if(!hasYearFilter()){
        return true;
    }
    if(app.videoMap[designator].video.years.length === 0){
        return false;
    }
    let attrList = app.videoMap[designator].years;
    return isFilterTypeMatch(app.years, app.filterMap.years, attrList);
}

function isFilterTypeMatch(list, map, attrList){
    let personFilter = list === app.persons;
    for(let i = 0; i <= list.length; i++){
        let filter = list[i];
        if(map[filter]){
            let matches = attrList.indexOf(filter) >= 0;
            if(!matches && personFilter){
                return false;
            }
            if(matches && !personFilter){
                return true;
            }
        }
    }
    return personFilter;
}

function resetAllFilters(){
    app.filterMap.recordedInCologne = false;
    app.filterMap.recordedInGardelegen = false;
    resetListFilters(app.persons, app.filterMap.persons);
    resetListFilters(app.years, app.filterMap.years);
    setFiltered();
}

function resetListFilters(list, map){
    for(let i = 0; i <= list.length; i++){
        map[list[i]] = false;
    }
}

function setFiltered(){
    app.filters = false;
    app.filterMap.personsFiltered = hasPersonFilter();
    app.filterMap.yearsFiltered = hasYearFilter();
    app.filterMap.recordedFiltered = app.filterMap.recordedInCologne || app.filterMap.recordedInCologne;
    app.filters = app.filterMap.personsFiltered || app.filterMap.yearsFiltered || app.filterMap.recordedFiltered;
}

function hasPersonFilter(){
    return isFiltered(app.persons, app.filterMap.persons);
}

function hasYearFilter(){
    return isFiltered(app.years, app.filterMap.years);
}

function isFiltered(list, map){
    for(let i = 0; i <= list.length; i++){
        if(map[list[i]]){
            return true;
        }
    }
    return false;
}