import Airtable from "airtable";

export default async (req, res) => {
  let option = req.query.option;
  let data = {};

  if (option?.[0].indexOf("photo") >= 0) {
    try {
      data = await Airtable
        .base('appbo8nzfBdKwOEoo')('photos')
        .select({
          view: "Grid view",
          filterByFormula: `{album_id} = '${option?.[1]}'`,
        })
        .firstPage();
      data = data.map(el => el.fields)
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Something went wrong! 😕" });
    }
  } else if (option?.[0].indexOf("photo/save") >= 0) {
    try {
      data = await Airtable
        .base('appbo8nzfBdKwOEoo')('photos')
        .create([
          {
            fields: {
              type: req.body.type,
              url: req.body.url,
            },
          }
        ], (err, records) => {
          if (err) {
            console.error(err);
            return;
          }
          data = data.map(el => el.fields)
          res.status(200).json(data);
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Something went wrong! 😕" });
    }
  } else {
    res.status(404).json({ msg: "Something went wrong! 😕" });
  }
}